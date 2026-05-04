<?php

namespace App\Form;

use App\Entity\Alumni;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AlumniVerificationType extends AbstractType
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
            ->add('yearGraduated', IntegerType::class, [
                'label' => 'Graduation Year',
                'required' => false,
                'attr' => ['class' => 'form-input', 'placeholder' => 'e.g. 2024'],
            ])
            ->add('isApproved', CheckboxType::class, [
                'mapped' => false,
                'required' => false,
                'label' => 'Approved',
                'data' => (bool) $options['is_approved'],
                'label_attr' => ['class' => 'form-check-label'],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Alumni::class,
            'is_approved' => false,
        ]);
    }
}
