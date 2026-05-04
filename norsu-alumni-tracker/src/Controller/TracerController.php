<?php

namespace App\Controller;

use App\Entity\AuditLog;
use App\Repository\AlumniRepository;
use App\Service\AuditLogger;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Automated Tracer Analytics for AACCUP accreditation reports.
 * Computes employment rates, job-to-degree alignment, salary distribution, etc.
 */
#[Route('/tracer')]
#[IsGranted('ROLE_STAFF')]
class TracerController extends AbstractController
{
    public function __construct(private AuditLogger $audit) {}

    #[Route('/', name: 'tracer_index', methods: ['GET'])]
    public function index(Request $request, AlumniRepository $repo): Response
    {
        $filterYear   = $request->query->get('year', '');
        $filterCourse = $request->query->get('course', '');

        // Build filtered query
        $qb = $repo->createQueryBuilder('a');
        if ($filterYear !== '') {
            $qb->andWhere('a.yearGraduated = :year')->setParameter('year', (int) $filterYear);
        }
        if ($filterCourse !== '') {
            $qb->andWhere('a.course = :course')->setParameter('course', $filterCourse);
        }

        $alumni = $qb->getQuery()->getResult();
        $total = count($alumni);

        // ── Employment Rate ──
        $employed = 0;
        $selfEmployed = 0;
        $unemployed = 0;
        $other = 0;

        foreach ($alumni as $a) {
            match ($a->getEmploymentStatus()) {
                'Employed' => $employed++,
                'Self-Employed' => $selfEmployed++,
                'Unemployed' => $unemployed++,
                default => $other++,
            };
        }

        $employmentRate = $total > 0 ? round(($employed + $selfEmployed) / $total * 100, 1) : 0;

        // ── Job-to-Degree Alignment (AACCUP Key Metric) ──
        $aligned = 0;
        $notAligned = 0;
        $noData = 0;

        foreach ($alumni as $a) {
            if ($a->isJobRelatedToCourse() === true) {
                $aligned++;
            } elseif ($a->isJobRelatedToCourse() === false) {
                $notAligned++;
            } else {
                $noData++;
            }
        }

        $alignmentRate = ($aligned + $notAligned) > 0
            ? round($aligned / ($aligned + $notAligned) * 100, 1) : 0;

        // ── Employment by Course (for chart) ──
        $courseStats = $repo->createQueryBuilder('a')
            ->select('a.course, a.employmentStatus, COUNT(a.id) as total')
            ->groupBy('a.course, a.employmentStatus')
            ->orderBy('a.course', 'ASC')
            ->getQuery()
            ->getResult();

        // Group by course
        $byCourse = [];
        foreach ($courseStats as $row) {
            $c = $row['course'] ?? 'Unknown';
            if (!isset($byCourse[$c])) {
                $byCourse[$c] = ['total' => 0, 'employed' => 0, 'selfEmployed' => 0, 'unemployed' => 0, 'aligned' => 0, 'totalAligned' => 0];
            }
            $byCourse[$c]['total'] += $row['total'];
            match ($row['employmentStatus']) {
                'Employed' => $byCourse[$c]['employed'] += $row['total'],
                'Self-Employed' => $byCourse[$c]['selfEmployed'] += $row['total'],
                'Unemployed' => $byCourse[$c]['unemployed'] += $row['total'],
                default => null,
            };
        }

        // Add alignment data per course
        $alignmentByCourse = $repo->createQueryBuilder('a')
            ->select('a.course, a.jobRelatedToCourse, COUNT(a.id) as cnt')
            ->where('a.jobRelatedToCourse IS NOT NULL')
            ->groupBy('a.course, a.jobRelatedToCourse')
            ->getQuery()
            ->getResult();

        foreach ($alignmentByCourse as $row) {
            $c = $row['course'] ?? 'Unknown';
            if (isset($byCourse[$c])) {
                $byCourse[$c]['totalAligned'] += $row['cnt'];
                if ($row['jobRelatedToCourse']) {
                    $byCourse[$c]['aligned'] += $row['cnt'];
                }
            }
        }

        // ── Salary Distribution ──
        $salaryRanges = [
            'Below ₱10,000' => 0,
            '₱10,000 - ₱19,999' => 0,
            '₱20,000 - ₱29,999' => 0,
            '₱30,000 - ₱49,999' => 0,
            '₱50,000+' => 0,
            'N/A' => 0,
        ];

        foreach ($alumni as $a) {
            $salary = $a->getMonthlySalary();
            if (!$salary) {
                $salaryRanges['N/A']++;
                continue;
            }
            // Extract first number from salary (handles ranges like "10000-20000")
            preg_match('/\d+/', $salary, $m);
            $num = (int) ($m[0] ?? 0);
            if ($num < 10000) $salaryRanges['Below ₱10,000']++;
            elseif ($num < 20000) $salaryRanges['₱10,000 - ₱19,999']++;
            elseif ($num < 30000) $salaryRanges['₱20,000 - ₱29,999']++;
            elseif ($num < 50000) $salaryRanges['₱30,000 - ₱49,999']++;
            else $salaryRanges['₱50,000+']++;
        }

        // ── Year Distribution ──
        $yearStats = $repo->createQueryBuilder('a')
            ->select('a.yearGraduated, COUNT(a.id) as total')
            ->where('a.yearGraduated IS NOT NULL')
            ->groupBy('a.yearGraduated')
            ->orderBy('a.yearGraduated', 'DESC')
            ->getQuery()
            ->getResult();

        // ── Employment Type Breakdown ──
        $typeStats = $repo->createQueryBuilder('a')
            ->select('a.employmentType, COUNT(a.id) as total')
            ->where('a.employmentType IS NOT NULL')
            ->groupBy('a.employmentType')
            ->orderBy('total', 'DESC')
            ->getQuery()
            ->getResult();

        // ── Filter dropdowns ──
        $courses = $repo->createQueryBuilder('a')
            ->select('DISTINCT a.course')->where('a.course IS NOT NULL')
            ->orderBy('a.course', 'ASC')->getQuery()->getSingleColumnResult();

        $years = $repo->createQueryBuilder('a')
            ->select('DISTINCT a.yearGraduated')->where('a.yearGraduated IS NOT NULL')
            ->orderBy('a.yearGraduated', 'DESC')->getQuery()->getSingleColumnResult();

        // Log access to tracer data (privacy compliance)
        $this->audit->log(
            AuditLog::ACTION_VIEW_TRACER,
            'TracerReport',
            null,
            'Viewed tracer analytics' . ($filterCourse ? " for {$filterCourse}" : '') . ($filterYear ? " year {$filterYear}" : '')
        );

        // Build courseStats in the format the template expects
        $courseStatsForTemplate = [];
        foreach ($byCourse as $courseName => $data) {
            $empTotal = $data['employed'] + $data['selfEmployed'];
            $rate = $data['total'] > 0 ? round($empTotal / $data['total'] * 100, 1) : 0;
            $courseStatsForTemplate[] = [
                'name' => $courseName,
                'total' => $data['total'],
                'employed' => $data['employed'],
                'unemployed' => $data['unemployed'],
                'selfEmployed' => $data['selfEmployed'],
                'freelance' => 0,
                'rate' => $rate,
            ];
        }

        // Build relevanceStats for template
        $relevanceStats = [
            ['label' => 'Aligned', 'count' => $aligned],
            ['label' => 'Not Aligned', 'count' => $notAligned],
            ['label' => 'No Data', 'count' => $noData],
        ];

        return $this->render('tracer/index.html.twig', [
            'totalAlumni'    => $total,
            'employed'       => $employed,
            'selfEmployed'   => $selfEmployed,
            'unemployed'     => $unemployed,
            'other'          => $other,
            'freelance'      => 0,
            'sixMonthRate'   => 0,
            'employmentRate' => $employmentRate,
            'aligned'        => $aligned,
            'notAligned'     => $notAligned,
            'noData'         => $noData,
            'alignmentRate'  => $alignmentRate,
            'relevanceStats' => $relevanceStats,
            'courseStats'     => $courseStatsForTemplate,
            'byCourse'       => $byCourse,
            'salaryRanges'   => $salaryRanges,
            'yearStats'      => $yearStats,
            'typeStats'      => $typeStats,
            'courses'        => $courses,
            'years'          => $years,
            'filterYear'     => $filterYear,
            'filterCourse'   => $filterCourse,
        ]);
    }

    /**
     * Export AACCUP tracer report as CSV for accreditation.
     */
    #[Route('/export', name: 'tracer_export', methods: ['GET'])]
    public function export(Request $request, AlumniRepository $repo): StreamedResponse
    {
        $filterYear   = $request->query->get('year', '');
        $filterCourse = $request->query->get('course', '');

        $qb = $repo->createQueryBuilder('a');
        if ($filterYear !== '') {
            $qb->andWhere('a.yearGraduated = :year')->setParameter('year', (int) $filterYear);
        }
        if ($filterCourse !== '') {
            $qb->andWhere('a.course = :course')->setParameter('course', $filterCourse);
        }

        $alumni = $qb->getQuery()->getResult();
        $total = count($alumni);

        // Compute stats
        $employed = $selfEmployed = $unemployed = $other = 0;
        $aligned = $notAligned = $noData = 0;

        $salaryRanges = [
            'Below P10,000' => 0, 'P10,000 - P19,999' => 0,
            'P20,000 - P29,999' => 0, 'P30,000 - P49,999' => 0,
            'P50,000+' => 0, 'N/A' => 0,
        ];

        foreach ($alumni as $a) {
            match ($a->getEmploymentStatus()) {
                'Employed' => $employed++,
                'Self-Employed' => $selfEmployed++,
                'Unemployed' => $unemployed++,
                default => $other++,
            };

            if ($a->isJobRelatedToCourse() === true) { $aligned++; }
            elseif ($a->isJobRelatedToCourse() === false) { $notAligned++; }
            else { $noData++; }

            $salary = $a->getMonthlySalary();
            if (!$salary) { $salaryRanges['N/A']++; continue; }
            preg_match('/\d+/', $salary, $m);
            $num = (int) ($m[0] ?? 0);
            if ($num < 10000) $salaryRanges['Below P10,000']++;
            elseif ($num < 20000) $salaryRanges['P10,000 - P19,999']++;
            elseif ($num < 30000) $salaryRanges['P20,000 - P29,999']++;
            elseif ($num < 50000) $salaryRanges['P30,000 - P49,999']++;
            else $salaryRanges['P50,000+']++;
        }

        $employmentRate = $total > 0 ? round(($employed + $selfEmployed) / $total * 100, 1) : 0;
        $alignmentRate = ($aligned + $notAligned) > 0
            ? round($aligned / ($aligned + $notAligned) * 100, 1) : 0;

        // Course-level data
        $courseStats = $repo->createQueryBuilder('a')
            ->select('a.course, a.employmentStatus, COUNT(a.id) as cnt')
            ->groupBy('a.course, a.employmentStatus')
            ->orderBy('a.course', 'ASC')
            ->getQuery()->getResult();

        $byCourse = [];
        foreach ($courseStats as $row) {
            $c = $row['course'] ?? 'Unknown';
            if (!isset($byCourse[$c])) {
                $byCourse[$c] = ['total' => 0, 'employed' => 0, 'selfEmployed' => 0, 'unemployed' => 0];
            }
            $byCourse[$c]['total'] += $row['cnt'];
            match ($row['employmentStatus']) {
                'Employed' => $byCourse[$c]['employed'] += $row['cnt'],
                'Self-Employed' => $byCourse[$c]['selfEmployed'] += $row['cnt'],
                'Unemployed' => $byCourse[$c]['unemployed'] += $row['cnt'],
                default => null,
            };
        }

        // Audit log
        $this->audit->log(
            AuditLog::ACTION_EXPORT_REPORT,
            'TracerReport',
            null,
            'Exported AACCUP tracer report (CSV)' . ($filterCourse ? " for {$filterCourse}" : '') . ($filterYear ? " year {$filterYear}" : '')
        );

        $filename = 'AACCUP_Tracer_Report_' . date('Y-m-d') . '.csv';

        $response = new StreamedResponse(function () use ($total, $employed, $selfEmployed, $unemployed, $other, $employmentRate, $aligned, $notAligned, $noData, $alignmentRate, $salaryRanges, $byCourse, $filterYear, $filterCourse) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8
            fwrite($handle, "\xEF\xBB\xBF");

            // Header
            fputcsv($handle, ['NORSU Alumni Tracer Study - AACCUP Accreditation Report']);
            fputcsv($handle, ['Generated: ' . date('F d, Y h:i A')]);
            if ($filterCourse) { fputcsv($handle, ['Course Filter: ' . $filterCourse]); }
            if ($filterYear) { fputcsv($handle, ['Year Filter: ' . $filterYear]); }
            fputcsv($handle, []);

            // Summary
            fputcsv($handle, ['=== SUMMARY STATISTICS ===']);
            fputcsv($handle, ['Metric', 'Value']);
            fputcsv($handle, ['Total Respondents', $total]);
            fputcsv($handle, ['Employment Rate', $employmentRate . '%']);
            fputcsv($handle, ['Job-Degree Alignment Rate', $alignmentRate . '%']);
            fputcsv($handle, []);

            // Employment Breakdown
            fputcsv($handle, ['=== EMPLOYMENT STATUS BREAKDOWN ===']);
            fputcsv($handle, ['Status', 'Count', 'Percentage']);
            $items = ['Employed' => $employed, 'Self-Employed' => $selfEmployed, 'Unemployed' => $unemployed, 'Other/N/A' => $other];
            foreach ($items as $label => $count) {
                $pct = $total > 0 ? round($count / $total * 100, 1) : 0;
                fputcsv($handle, [$label, $count, $pct . '%']);
            }
            fputcsv($handle, []);

            // Job-Degree Alignment
            fputcsv($handle, ['=== JOB-TO-DEGREE ALIGNMENT (AACCUP) ===']);
            fputcsv($handle, ['Category', 'Count']);
            fputcsv($handle, ['Aligned', $aligned]);
            fputcsv($handle, ['Not Aligned', $notAligned]);
            fputcsv($handle, ['No Data', $noData]);
            fputcsv($handle, []);

            // Salary Distribution
            fputcsv($handle, ['=== SALARY DISTRIBUTION ===']);
            fputcsv($handle, ['Range', 'Count']);
            foreach ($salaryRanges as $range => $count) {
                fputcsv($handle, [$range, $count]);
            }
            fputcsv($handle, []);

            // Per-Course Breakdown
            fputcsv($handle, ['=== COURSE-LEVEL EMPLOYMENT ===']);
            fputcsv($handle, ['Course', 'Total', 'Employed', 'Self-Employed', 'Unemployed', 'Employment Rate']);
            foreach ($byCourse as $course => $data) {
                $rate = $data['total'] > 0 ? round(($data['employed'] + $data['selfEmployed']) / $data['total'] * 100, 1) : 0;
                fputcsv($handle, [$course, $data['total'], $data['employed'], $data['selfEmployed'], $data['unemployed'], $rate . '%']);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

        return $response;
    }
}
