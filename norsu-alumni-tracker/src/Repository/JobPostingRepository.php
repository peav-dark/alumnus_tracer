<?php

namespace App\Repository;

use App\Entity\JobPosting;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<JobPosting>
 */
class JobPostingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, JobPosting::class);
    }

    /**
     * Get active, non-expired job postings.
     * @return JobPosting[]
     */
    public function findActiveJobs(): array
    {
        return $this->createQueryBuilder('j')
            ->where('j.isActive = true')
            ->andWhere('j.deadline IS NULL OR j.deadline >= :today')
            ->setParameter('today', new \DateTime('today'))
            ->orderBy('j.datePosted', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get jobs matching a specific course/program.
     * @return JobPosting[]
     */
    public function findByCourse(string $course): array
    {
        return $this->createQueryBuilder('j')
            ->where('j.isActive = true')
            ->andWhere('j.relatedCourse LIKE :course')
            ->setParameter('course', '%' . $course . '%')
            ->andWhere('j.deadline IS NULL OR j.deadline >= :today')
            ->setParameter('today', new \DateTime('today'))
            ->orderBy('j.datePosted', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
