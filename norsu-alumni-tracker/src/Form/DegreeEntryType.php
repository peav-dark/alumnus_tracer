<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;

class DegreeEntryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $currentYear = (int) date('Y');
        $yearRange = range($currentYear, 1990);
        $yearChoices = array_combine($yearRange, $yearRange);

        $builder
            ->add('college', ChoiceType::class, [
                'required' => false,
                'label' => false,
                'placeholder' => '— College / University —',
                'attr' => ['class' => 'form-select'],
                'choices' => [
                    'College of Arts and Sciences' => 'College of Arts and Sciences',
                    'College of Business and Management' => 'College of Business and Management',
                    'College of Criminal Justice Education' => 'College of Criminal Justice Education',
                    'College of Education' => 'College of Education',
                    'College of Engineering and Architecture' => 'College of Engineering and Architecture',
                    'College of Industrial Technology' => 'College of Industrial Technology',
                    'College of Agriculture and Forestry' => 'College of Agriculture and Forestry',
                    'College of Nursing and Allied Health Sciences' => 'College of Nursing and Allied Health Sciences',
                    'College of Computer Studies' => 'College of Computer Studies',
                    'College of Law' => 'College of Law',
                    'Graduate School' => 'Graduate School',
                ],
            ])
            ->add('yearGraduated', ChoiceType::class, [
                'required' => false,
                'label' => false,
                'placeholder' => '— Year —',
                'attr' => ['class' => 'form-select'],
                'choices' => $yearChoices,
            ]);
    }
}
