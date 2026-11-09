/* Inteligência Artificial — fictitious course. */
(function (root) {
  'use strict';
  var D = root.App.data;
  var f = D.factory('ia');
  var it = f.it, graded = f.graded, week = D.week;
  var T = 'Prof. Diego Nunes';

  D.courses.push({
    id: 'ia',
    name: 'Inteligência Artificial',
    shortName: 'IA',
    code: 'CC',
    area: 'IA e Dados',
    term: '2026/2',
    status: 'andamento',
    color: '#c45f22',
    teacher: { name: T },
    room: 'Lab C3-110',
    schedule: 'Quintas, 19:00–20:40',
    office: 'Quintas, 17:00–18:30, sala C3-204',
    workload: '60 h (4 créditos presenciais)',
    lastAccess: '2026-11-05T20:55',
    favoriteByDefault: false,

    plan: {
      ementa: 'Agentes inteligentes. Resolução de problemas por busca. Representação de conhecimento. Aprendizado de máquina supervisionado. Avaliação de modelos. Ética e impactos sociais da IA.',
      objetivos: [
        'Formular problemas como busca em espaço de estados.',
        'Treinar e avaliar modelos de aprendizado supervisionado.',
        'Interpretar métricas de desempenho e reconhecer sobreajuste.',
        'Discutir criticamente impactos éticos e sociais de sistemas de IA.',
      ],
      conteudo: ['Agentes inteligentes', 'Busca cega e heurística', 'Regressão linear', 'Classificação: kNN e árvores de decisão', 'Avaliação de modelos', 'Redes neurais (introdução)', 'Ética em IA'],
      metodologia: 'Aulas expositivas e notebooks Python em laboratório; projeto final em grupo.',
      avaliacao: [
        { item: 'Notebooks práticos', peso: 44 },
        { item: 'Questionários', peso: 14 },
        { item: 'Debates', peso: 8 },
        { item: 'Projeto final', peso: 34 },
      ],
      bibliografia: [
        'RUSSELL, S.; NORVIG, P. Inteligência Artificial: uma abordagem moderna. 4. ed. Rio de Janeiro: GEN LTC, 2022.',
        'GÉRON, A. Mãos à obra: aprendizado de máquina com Scikit-Learn, Keras e TensorFlow. 2. ed. Rio de Janeiro: Alta Books, 2021.',
      ],
    },

    notices: [
      { id: 'ia-a1', title: 'Debate sobre ética em IA na quinta', body: 'Leiam os dois textos da semana de 09 a 15/11 antes da aula. A participação no fórum vale nota.', author: T, date: '2026-11-06T11:00' },
      { id: 'ia-a2', title: 'Proposta do projeto final', body: 'O modelo da proposta está disponível. Grupos de até 3 pessoas; prazo 19/11.', author: T, date: '2026-10-30T15:20' },
      { id: 'ia-a3', title: 'Ambiente do laboratório atualizado', body: 'O Python dos computadores do Lab C3-110 foi atualizado. Usem o ambiente "ia-2026".', author: T, date: '2026-10-22T08:05' },
    ],

    participants: D.makeParticipants(T, 14, 19, '2026-11-07T10:30'),
    events: [{ date: '2026-11-12', time: '19:00', title: 'Debate: ética em IA' }],

    sections: [
      {
        id: 'ia-s0', title: 'Geral',
        items: [
          it('forum', 'Avisos'),
          it('texto', 'Horários', { text: ['<strong>Aulas:</strong> quintas-feiras, 19:00–20:40, Lab C3-110.', '<strong>Atendimento:</strong> quintas-feiras, 17:00–18:30, sala C3-204.'] }),
          it('link', 'Notebooks da disciplina'),
        ],
      },
      week('ia', 1, 'Apresentação. O que é inteligência artificial.', [
        it('pptx', 'Introdução à IA'),
        graded('forum', 'Onde você já encontrou IA hoje?', { due: '2026-08-23T23:59', submitted: true, grade: 10, weight: 2 }),
      ]),
      week('ia', 2, 'Agentes inteligentes.', [
        it('pdf', 'Agentes e ambientes'),
        graded('questionario', 'Questionário: fundamentos', { due: '2026-08-30T23:59', submitted: true, grade: 8, weight: 4 }),
      ]),
      week('ia', 3, 'Resolução de problemas por busca.', [
        it('pptx', 'Busca em largura e em profundidade'),
      ], [['EaD (2h)', [graded('tarefa', 'Notebook: busca em espaço de estados', { opens: '2026-08-31T19:00', due: '2026-09-13T23:59', submitted: true, grade: 9, weight: 10 })]]]),
      week('ia', 4, 'Busca heurística e A*.', [
        it('video', 'A* passo a passo'),
        graded('questionario', 'Questionário: busca heurística', { due: '2026-09-20T23:59', submitted: true, grade: 7.5, weight: 4 }),
      ]),
      week('ia', 5, 'Aprendizado supervisionado: regressão.', [
        it('pdf', 'Regressão linear'),
        graded('tarefa', 'Notebook: regressão linear', { opens: '2026-09-21T19:00', due: '2026-09-27T23:59', submitted: true, grade: 8.5, weight: 10 }),
      ]),
      week('ia', 6, 'Classificação: kNN e árvores de decisão.', [
        it('pptx', 'Classificadores'),
      ], [['EaD (4h)', [graded('tarefa', 'Notebook: kNN e árvores de decisão', { opens: '2026-09-28T19:00', due: '2026-10-18T23:59', submitted: true, grade: 9, weight: 12 })]]]),
      week('ia', 7, 'Avaliação de modelos.', [
        it('pdf', 'Métricas: acurácia, precisão, revocação e F1'),
        graded('questionario', 'Questionário: avaliação de modelos', { due: '2026-10-25T23:59', submitted: true, grade: 8, weight: 6 }),
      ]),
      week('ia', 8, 'Experimento de classificação.', [
        it('link', 'Base de dados do experimento'),
      ], [['EaD (2h)', [graded('tarefa', 'Experimento com classificação', { opens: '2026-10-26T19:00', due: '2026-11-01T23:59', submitted: true, grade: 8.7, weight: 12, feedback: 'Boa análise; discuta melhor o desbalanceamento.' })]]]),
      week('ia', 9, 'Ética e impactos sociais da IA.', [
        it('pdf', 'Vieses em sistemas de IA'),
        it('video', 'IA e sociedade'),
        graded('forum', 'Debate: ética em IA', { opens: '2026-11-09T00:00', due: '2026-11-12T23:59', submitted: false, grade: null, weight: 6 }),
      ]),
      week('ia', 10, 'Redes neurais: introdução. Proposta do projeto.', [
        it('pptx', 'Perceptron e redes multicamadas'),
      ], [['Projeto', [
        it('arquivo', 'Modelo de proposta do projeto'),
        graded('tarefa', 'Projeto final — proposta', { opens: '2026-10-30T00:00', due: '2026-11-19T23:59', submitted: false, grade: null, weight: 10 }),
      ]]]),
      week('ia', 11, 'Desenvolvimento do projeto.', [it('link', 'Guia de boas práticas em experimentos')]),
      week('ia', 12, 'Entrega do projeto final.', [
        graded('tarefa', 'Projeto final — relatório e código', { opens: '2026-11-20T00:00', due: '2026-12-06T23:59', submitted: false, grade: null, weight: 24 }),
      ]),
    ],
  });
})(typeof window !== 'undefined' ? window : this);
