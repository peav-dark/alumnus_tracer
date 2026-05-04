<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class, [
                'label' => 'First Name',
                'attr' => ['class' => 'form-input'],
            ])
            ->add('lastName', TextType::class, [
                'label' => 'Last Name',
                'attr' => ['class' => 'form-input'],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email Address',
                'attr' => ['class' => 'form-input'],
            ])
            ->add('accountStatus', ChoiceType::class, [
                'label' => 'Account Status',
                'choices' => [
                    'Active' => 'active',
                    'Inactive' => 'inactive',
                    'Pending' => 'pending',
                ],
                'attr' => ['class' => 'form-select'],
            ])
            ->add('roles', ChoiceType::class, [
                'label' => 'Roles',
                'choices' => [
                    'Alumni' => 'ROLE_USER',
                    'Staff' => 'ROLE_STAFF',
                    'Admin' => 'ROLE_ADMIN',
                ],
                'attr' => ['class' => 'form-select'],
                'empty_data' => 'ROLE_USER',
            ]);

        $builder->get('roles')->addModelTransformer(new CallbackTransformer(
            function (?array $rolesAsArray): string {
                if (is_array($rolesAsArray) && in_array('ROLE_ADMIN', $rolesAsArray, true)) {
                    return 'ROLE_ADMIN';
                }

                if (is_array($rolesAsArray) && in_array('ROLE_STAFF', $rolesAsArray, true)) {
                    return 'ROLE_STAFF';
                }

                return 'ROLE_USER';
            },
            function (string|array|null $roleAsString): array {
                if (is_array($roleAsString)) {
                    return array_values(array_unique($roleAsString));
                }

                if ($roleAsString === 'ROLE_ADMIN') {
                    return ['ROLE_ADMIN'];
                }

                if ($roleAsString === 'ROLE_STAFF') {
                    return ['ROLE_STAFF'];
                }

                return ['ROLE_USER'];
            }
        ));
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
