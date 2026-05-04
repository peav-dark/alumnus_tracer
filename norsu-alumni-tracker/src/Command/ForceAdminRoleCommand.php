<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:user:force-admin',
    description: 'Finds a user by email and force-sets ROLE_ADMIN',
)]
class ForceAdminRoleCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email of the user to promote to ROLE_ADMIN');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = strtolower(trim((string) $input->getArgument('email')));

        if ($email === '') {
            $io->error('Email argument is required.');
            return Command::INVALID;
        }

        /** @var User|null $user */
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user instanceof User) {
            $io->error(sprintf('No user found with email: %s', $email));
            return Command::FAILURE;
        }

        $rolesBefore = $user->getRoles();
        $user->setRoles(['ROLE_ADMIN']);
        $user->setAccountStatus('active');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success(sprintf('User %s has been promoted to ROLE_ADMIN.', $user->getEmail()));
        $io->writeln('Previous roles: ' . implode(', ', $rolesBefore));
        $io->writeln('Current roles: ' . implode(', ', $user->getRoles()));

        return Command::SUCCESS;
    }
}
