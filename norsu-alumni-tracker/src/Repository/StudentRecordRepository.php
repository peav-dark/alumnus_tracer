<?php

namespace App\Repository;

use App\Entity\StudentRecord;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StudentRecord>
 */
class StudentRecordRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StudentRecord::class);
    }

    /**
     * Search unclaimed student records by student ID (partial match).
     *
     * @return StudentRecord[]
     */
    public function searchByStudentId(string $query, int $limit = 10): array
    {
        $normalizedQuery = trim($query);

        if ($normalizedQuery === '') {
            return [];
        }

        return $this->createQueryBuilder('sr')
            ->where('sr.studentId LIKE :q')
            ->andWhere('sr.claimedByUser IS NULL')
            ->setParameter('q', '%' . $normalizedQuery . '%')
            ->orderBy('sr.studentId', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a single unclaimed record by exact student ID.
     */
    public function findUnclaimedByStudentId(string $studentId): ?StudentRecord
    {
        return $this->createQueryBuilder('sr')
            ->where('sr.studentId = :sid')
            ->andWhere('sr.claimedByUser IS NULL')
            ->setParameter('sid', trim($studentId))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find a record by exact student ID regardless of claim status.
     */
    public function findByStudentId(string $studentId): ?StudentRecord
    {
        return $this->findOneBy(['studentId' => trim($studentId)]);
    }

    /**
     * Count all unclaimed student records.
     */
    public function countUnclaimed(): int
    {
        return (int) $this->createQueryBuilder('sr')
            ->select('COUNT(sr.id)')
            ->where('sr.claimedByUser IS NULL')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all claimed student records.
     */
    public function countClaimed(): int
    {
        return (int) $this->createQueryBuilder('sr')
            ->select('COUNT(sr.id)')
            ->where('sr.claimedByUser IS NOT NULL')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get all records with optional filtering and pagination.
     *
     * @return StudentRecord[]
     */
    public function findFiltered(?string $search = null, ?string $claimStatus = null, int $limit = 50, int $offset = 0): array
    {
        $qb = $this->createQueryBuilder('sr')
            ->orderBy('sr.importedAt', 'DESC');

        if ($search !== null && trim($search) !== '') {
            $qb->andWhere('sr.studentId LIKE :q OR sr.firstName LIKE :q OR sr.lastName LIKE :q')
                ->setParameter('q', '%' . trim($search) . '%');
        }

        if ($claimStatus === 'claimed') {
            $qb->andWhere('sr.claimedByUser IS NOT NULL');
        } elseif ($claimStatus === 'unclaimed') {
            $qb->andWhere('sr.claimedByUser IS NULL');
        }

        return $qb
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }
}
