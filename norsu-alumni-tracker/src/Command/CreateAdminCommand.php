<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Create a fresh admin user interactively',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        /** @var QuestionHelper $helper */
        $helper = $this->getHelper('question');

        $emailQuestion = new Question('Admin email: ');
        $emailQuestion->setValidator(function (?string $answer): string {
            $email = strtolower(trim((string) $answer));
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new \RuntimeException('Please provide a valid email address.');
            }

            return $email;
        });

        $passwordQuestion = new Question('Admin password: ');
        $passwordQuestion->setHidden(true);
        $passwordQuestion->setHiddenFallback(false);
        $passwordQuestion->setValidator(function (?string $answer): string {
            $password = (string) $answer;
            if (strlen($password) < 8) {
                throw new \RuntimeException('Password must be at least 8 characters long.');
            }

            return $password;
        });

        $email = $helper->ask($input, $output, $emailQuestion);
        $password = $helper->ask($input, $output, $passwordQuestion);

        $existing = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing instanceof User) {
            $io->error(sprintf('A user with email %s already exists.', $email));
            return Command::FAILURE;
        }

        $admin = new User();
        $admin->setEmail($email);
        $admin->setFirstName('System');
        $admin->setLastName('Administrator');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setAccountStatus('active');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, $password));

        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $io->success(sprintf('Admin account created for %s.', $email));

        return Command::SUCCESS;
    }
}
