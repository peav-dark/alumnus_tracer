<?php

namespace App\Repository;

use App\Entity\ResetPasswordToken;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ResetPasswordToken>
 */
class ResetPasswordTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ResetPasswordToken::class);
    }

    public function removeExistingTokensForUser(User $user): void
    {
        $this->createQueryBuilder('t')
            ->delete()
            ->where('t.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    public function removeExpiredTokens(): void
    {
        $this->createQueryBuilder('t')
            ->delete()
            ->where('t.expiresAt <= :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}
