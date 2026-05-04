<?php

namespace App\Repository;

use App\Entity\Announcement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Announcement>
 */
class AnnouncementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Announcement::class);
    }

    /**
     * @return Announcement[]
     */
    public function findActiveAnnouncements(int $limit = 10): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('a.datePosted', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
