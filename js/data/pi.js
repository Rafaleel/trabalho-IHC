/* Projeto Integrador — fictitious course. */
(function (root) {
  'use strict';
  var D = root.App.data;
  var f = D.factory('pi');
  var it = f.it, graded = f.graded, week = D.week;
  var T = 'Profa. Amanda Costa';

  D.courses.push({
    id: 'pi',
    name: 'Projeto Integrador',
    shortName: 'PI',
    code: 'CC',
    area: 'Projeto',
    term: '2026/2',
    status: 'andamento',
    color: '#b4407e',
    teacher: { name: T },
    room: 'Sala A2-114',
    schedule: 'Sextas, 20:30–22:20',
    office: 'Sextas, 18:30–20:00, sala A2-201',
    workload: '60 h (4 créditos presenciais)',
    lastAccess: '2026-11-06T22:30',
    favoriteByDefault: true,

    plan: {
      ementa: 'Desenvolvimento de um projeto de software em equipe integrando conhecimentos do curso. Gestão ágil, requisitos, prototipação, arquitetura, implementação, testes e apresentação de resultados.',
      objetivos: [
        'Planejar e executar um projeto de software em equipe.',
        'Aplicar práticas ágeis de gestão (backlog, sprints e checkpoints).',
        'Integrar requisitos, design de interação, arquitetura e implementação.',
        'Comunicar resultados técnicos de forma clara.',
      ],
      conteudo: ['Formação de equipes e termo de abertura', 'Levantamento de requisitos', 'Prototipação', 'Arquitetura e backlog', 'Sprints e revisões', 'Apresentação e relatório final'],
      metodologia: 'Aprendizagem baseada em projetos, com checkpoints quinzenais com a professora.',
      avaliacao: [
        { item: 'Entregas intermediárias', peso: 48 },
        { item: 'Checkpoints', peso: 15 },
        { item: 'Apresentação parcial', peso: 12 },
        { item: 'Entrega final', peso: 25 },
      ],
      bibliografia: [
        'SCHWABER, K.; SUTHERLAND, J. Guia do Scrum. 2020.',
        'PRESSMAN, R.; MAXIM, B. Engenharia de software: uma abordagem profissional. 9. ed. Porto Alegre: AMGH, 2021.',
      ],
    },

    notices: [
      { id: 'pi-a1', title: 'Checkpoint 3 na próxima sexta', body: 'Tragam o quadro de tarefas atualizado e uma demonstração do que foi feito na sprint.', author: T, date: '2026-11-06T22:40' },
      { id: 'pi-a2', title: 'Sprint review 1 avaliada', body: 'As notas e comentários da sprint review 1 estão na aba Notas.', author: T, date: '2026-11-05T16:20' },
      { id: 'pi-a3', title: 'Modelo da apresentação parcial', body: 'Usem o modelo de slides disponível na semana de 16 a 22/11. Cada grupo terá 10 minutos.', author: T, date: '2026-10-31T10:00' },
    ],

    participants: D.makeParticipants(T, 20, 16, '2026-11-07T18:00'),
    events: [{ date: '2026-11-20', time: '20:30', title: 'Apresentações parciais dos projetos' }],

    sections: [
      {
        id: 'pi-s0', title: 'Geral',
        items: [
          it('forum', 'Avisos'),
          it('texto', 'Horários', { text: ['<strong>Encontros:</strong> sextas-feiras, 20:30–22:20, sala A2-114.', '<strong>Atendimento:</strong> sextas-feiras, 18:30–20:00, sala A2-201.'] }),
          it('link', 'Quadro de tarefas dos grupos'),
          it('pdf', 'Guia do Projeto Integrador'),
        ],
      },
      week('pi', 1, 'Apresentação da disciplina. Formação dos grupos.', [
        graded('forum', 'Formação dos grupos', { due: '2026-08-23T23:59', submitted: true, grade: 10, weight: 3 }),
      ]),
      week('pi', 2, 'Escopo do projeto.', [], [['Entrega', [
        it('arquivo', 'Modelo do termo de abertura'),
        graded('tarefa', 'Termo de abertura do projeto', { opens: '2026-08-24T20:30', due: '2026-08-30T23:59', submitted: true, grade: 9, weight: 8 }),
      ]]]),
      week('pi', 3, 'Levantamento de requisitos.', [
        it('pptx', 'Técnicas de levantamento de requisitos'),
        graded('tarefa', 'Documento de requisitos', { opens: '2026-08-31T20:30', due: '2026-09-13T23:59', submitted: true, grade: 8.5, weight: 10 }),
      ]),
      week('pi', 4, 'Checkpoint 1.', [
        graded('forum', 'Checkpoint 1 — relato do grupo', { due: '2026-09-20T23:59', submitted: true, grade: 10, weight: 4 }),
      ]),
      week('pi', 5, 'Prototipação.', [
        it('link', 'Exemplos de protótipos de baixa fidelidade'),
      ], [['Entrega', [graded('tarefa', 'Protótipo de baixa fidelidade', { opens: '2026-09-21T20:30', due: '2026-09-27T23:59', submitted: true, grade: 9, weight: 10 })]]]),
      week('pi', 6, 'Arquitetura e backlog.', [
        it('pptx', 'Arquitetura de software para o projeto'),
        graded('tarefa', 'Arquitetura e backlog inicial', { opens: '2026-09-28T20:30', due: '2026-10-18T23:59', submitted: true, grade: 8, weight: 10 }),
      ]),
      week('pi', 7, 'Checkpoint 2.', [
        graded('forum', 'Checkpoint 2 — relato do grupo', { due: '2026-10-25T23:59', submitted: true, grade: 10, weight: 4 }),
      ]),
      week('pi', 8, 'Sprint 1 de implementação.', [], [['Sprint review', [
        graded('tarefa', 'Sprint review 1', { opens: '2026-10-26T20:30', due: '2026-11-06T23:59', submitted: true, grade: 9, weight: 10, feedback: 'Boa demonstração; priorizem os testes.' }),
      ]]]),
      week('pi', 9, 'Checkpoint 3.', [
        graded('forum', 'Checkpoint 3 — relato do grupo', { opens: '2026-11-09T00:00', due: '2026-11-13T23:59', submitted: false, grade: null, weight: 4 }),
      ]),
      week('pi', 10, 'Apresentação parcial.', [], [['Apresentação', [
        it('pptx', 'Modelo de slides da apresentação parcial'),
        graded('tarefa', 'Apresentação parcial do projeto', { opens: '2026-11-09T00:00', due: '2026-11-20T20:30', submitted: false, grade: null, weight: 12 }),
      ]]]),
      week('pi', 11, 'Sprint 2 de implementação.', [it('link', 'Checklist de qualidade antes da entrega')]),
      week('pi', 12, 'Entrega final.', [
        graded('tarefa', 'Entrega final: sistema e relatório', { opens: '2026-11-23T00:00', due: '2026-12-04T23:59', submitted: false, grade: null, weight: 25 }),
      ]),
    ],
  });
})(typeof window !== 'undefined' ? window : this);
