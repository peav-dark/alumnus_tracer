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
            ->add('alumniCollege', TextType::class, [
                'label' => 'College',
                'property_path' => 'alumni.college',
                'required' => false,
                'attr' => ['class' => 'form-input'],
            ])
            ->add('alumniDepartment', TextType::class, [
                'label' => 'Department',
                'property_path' => 'alumni.degreeProgram',
                'required' => false,
                'attr' => ['class' => 'form-input'],
            ]);

        // Map unmapped alumni fields to nested Alumni entity using property paths during submit in controller

    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
