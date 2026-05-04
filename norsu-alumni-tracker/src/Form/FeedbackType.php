<?php

namespace App\Form;

use App\Entity\Feedback;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class FeedbackType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('suggestions', TextareaType::class, [
                'label' => 'Suggestions for the University',
                'required' => false,
                'attr' => ['class' => 'form-input', 'rows' => 4, 'placeholder' => 'Share your thoughts on how the university can improve...'],
            ])
            ->add('recommendUniversity', CheckboxType::class, [
                'label' => 'I would recommend NORSU to prospective students',
                'required' => false,
                'label_attr' => ['class' => 'form-check-label'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Feedback::class,
        ]);
    }
}
