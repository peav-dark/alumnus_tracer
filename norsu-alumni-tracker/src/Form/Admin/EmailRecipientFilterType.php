<?php

namespace App\Form\Admin;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class EmailRecipientFilterType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $yearChoices = [];
        foreach ($options['years'] as $year) {
            $yearChoices[(string) $year] = (int) $year;
        }

        $builder
            ->add('yearGraduated', ChoiceType::class, [
                'label' => 'Year Graduated',
                'required' => false,
                'placeholder' => 'All years',
                'choices' => $yearChoices,
                'attr' => [
                    'class' => 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200',
                ],
            ])
            ->add('filter', SubmitType::class, [
                'label' => 'Apply',
                'attr' => [
                    'class' => 'btn-norsu w-full',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'method' => 'GET',
            'csrf_protection' => false,
            'years' => [],
        ]);

        $resolver->setAllowedTypes('years', 'array');
    }
}
