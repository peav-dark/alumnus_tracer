<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class StaffRegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class, [
                'attr' => ['class' => 'form-input', 'placeholder' => 'First Name'],
                'label' => 'First Name',
            ])
            ->add('lastName', TextType::class, [
                'attr' => ['class' => 'form-input', 'placeholder' => 'Last Name'],
                'label' => 'Last Name',
            ])
            ->add('email', EmailType::class, [
                'attr' => ['class' => 'form-input', 'placeholder' => 'Email Address'],
                'label' => 'Email',
            ])
            ->add('department', TextType::class, [
                'mapped' => false,
                'required' => false,
                'attr' => ['class' => 'form-input', 'placeholder' => 'e.g. College of Arts & Sciences'],
                'label' => 'Department (Optional)',
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'mapped' => false,
                'first_options' => [
                    'attr' => ['class' => 'form-input', 'placeholder' => 'Password'],
                    'label' => 'Password',
                    'constraints' => [
                        new NotBlank(message: 'Please enter a password'),
                        new Length(
                            min: 8,
                            minMessage: 'Your password should be at least {{ limit }} characters',
                            max: 4096,
                        ),
                        new Regex(
                            pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/',
                            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
                        ),
                    ],
                ],
                'second_options' => [
                    'attr' => ['class' => 'form-input', 'placeholder' => 'Repeat Password'],
                    'label' => 'Repeat Password',
                ],
                'invalid_message' => 'The password fields must match.',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
