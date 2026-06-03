<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Grade Nomenclatures
    |--------------------------------------------------------------------------
    |
    | This configuration lists all available grade types in the academic system,
    | mapping slugs to human-readable singular and plural formats. Editing these
    | labels will dynamically update all headers, options, and tables.
    |
    */
    'nomenclatures' => [
        'prova' => [
            'label' => 'Prova',
            'plural' => 'Provas',
            'icon' => 'FileText',
        ],
        'trabalho' => [
            'label' => 'Trabalho',
            'plural' => 'Trabalhos',
            'icon' => 'Clipboard',
        ],
        'projeto' => [
            'label' => 'Projeto',
            'plural' => 'Projetos',
            'icon' => 'Award',
        ],
        'atividade' => [
            'label' => 'Atividade',
            'plural' => 'Atividades',
            'icon' => 'BookOpen',
        ],
        'outros' => [
            'label' => 'Outro',
            'plural' => 'Outros',
            'icon' => 'PlusCircle',
        ],
    ],
];
