/* Banco de Dados — fictitious course. Holds the only overdue activity of the prototype. */
(function (root) {
  'use strict';
  var D = root.App.data;
  var f = D.factory('bd');
  var it = f.it, graded = f.graded, week = D.week;
  var T = 'Profa. Laura Farias';

  D.courses.push({
    id: 'bd',
    name: 'Banco de Dados',
    shortName: 'BD',
    code: 'CC',
    area: 'Dados',
    term: '2026/2',
    status: 'andamento',
    color: '#6b4fc7',
    teacher: { name: T },
    room: 'Sala C1-207',
    schedule: 'Terças, 18:40–20:20',
    office: 'Terças, 16:30–18:00, sala C1-115',
    workload: '60 h (4 créditos presenciais)',
    lastAccess: '2026-11-08T09:15',
    favoriteByDefault: false,

    plan: {
      ementa: 'Conceitos de sistemas de banco de dados. Modelagem conceitual (ER) e lógica (relacional). Normalização. Linguagem SQL: DDL, DML e consultas. Índices e noções de otimização. Transações.',
      objetivos: [
        'Modelar dados a partir de requisitos usando os modelos ER e relacional.',
        'Aplicar normalização para evitar redundâncias e anomalias.',
        'Escrever consultas SQL envolvendo junções, agregações e subconsultas.',
        'Compreender índices e transações em um SGBD.',
      ],
      conteudo: ['Introdução a SGBDs', 'Modelo Entidade-Relacionamento', 'Modelo relacional', 'Normalização', 'SQL: DDL e DML', 'Junções e agregações', 'Subconsultas', 'Índices e transações'],
      metodologia: 'Aulas expositivas com exercícios práticos em PostgreSQL e um projeto de banco de dados em duplas.',
      avaliacao: [
        { item: 'Listas de exercícios SQL', peso: 32 },
        { item: 'Modelagem (ER e relacional)', peso: 20 },
        { item: 'Questionários e participação', peso: 12 },
        { item: 'Projeto de banco de dados', peso: 36 },
      ],
      bibliografia: [
        'ELMASRI, R.; NAVATHE, S. B. Sistemas de banco de dados. 7. ed. São Paulo: Pearson, 2018.',
        'HEUSER, C. A. Projeto de banco de dados. 6. ed. Porto Alegre: Bookman, 2009.',
      ],
    },

    notices: [
      { id: 'bd-a1', title: 'Notas da Lista 3 (JOINs) lançadas', body: 'Confiram os comentários na aba Notas. A maioria dos erros foi em LEFT JOIN com filtros no WHERE.', author: T, date: '2026-11-08T09:12' },
      { id: 'bd-a2', title: 'Lista 4 aceita envio com atraso até 10/11', body: 'Quem não enviou a Lista 4 (subconsultas) pode enviar até terça, 10/11, com desconto de 10%.', author: T, date: '2026-11-05T19:30' },
      { id: 'bd-a3', title: 'Laboratório de índices na próxima aula', body: 'Na terça teremos laboratório de índices. Tragam o banco do projeto populado.', author: T, date: '2026-11-03T21:00' },
    ],

    participants: D.makeParticipants(T, 9, 20, '2026-11-08T08:40'),
    events: [{ date: '2026-11-10', time: '18:40', title: 'Laboratório de índices' }],

    sections: [
      {
        id: 'bd-s0', title: 'Geral',
        items: [
          it('forum', 'Avisos'),
          it('texto', 'Horários', { text: ['<strong>Aulas:</strong> terças-feiras, 18:40–20:20, sala C1-207.', '<strong>Atendimento:</strong> terças-feiras, 16:30–18:00, sala C1-115.'] }),
          it('link', 'Instalação do PostgreSQL e do DBeaver'),
          it('pdf', 'Esquema do banco de exemplo "Biblioteca"'),
        ],
      },
      week('bd', 1, 'Apresentação. Introdução a sistemas de banco de dados.', [
        it('pptx', 'Introdução a SGBDs'),
        graded('forum', 'Expectativas para a disciplina', { due: '2026-08-23T23:59', submitted: true, grade: 10, weight: 2 }),
      ]),
      week('bd', 2, 'Arquitetura de SGBDs e modelos de dados.', [
        it('pdf', 'Modelos de dados'),
        graded('questionario', 'Questionário: conceitos de banco de dados', { due: '2026-08-30T23:59', submitted: true, grade: 9, weight: 4 }),
      ]),
      week('bd', 3, 'Modelo Entidade-Relacionamento.', [
        it('pptx', 'Modelo ER'),
        it('link', 'Ferramenta brModelo'),
      ], [['EaD (2h)', [graded('tarefa', 'Modelo ER do sistema de biblioteca', { opens: '2026-08-31T18:40', due: '2026-09-13T23:59', submitted: true, grade: 8, weight: 10, feedback: 'Cardinalidades de Empréstimo incorretas.' })]]]),
      week('bd', 4, 'Modelo relacional e mapeamento do ER para o relacional.', [
        it('pdf', 'Mapeamento ER para relacional'),
        graded('tarefa', 'Modelo relacional da biblioteca', { opens: '2026-09-14T18:40', due: '2026-09-20T23:59', submitted: true, grade: 9, weight: 10 }),
      ]),
      week('bd', 5, 'Normalização.', [
        it('pptx', 'Formas normais'),
        graded('questionario', 'Questionário: normalização', { due: '2026-09-27T23:59', submitted: true, grade: 7, weight: 6 }),
      ]),
      week('bd', 6, 'SQL: DDL e DML.', [
        it('pdf', 'Referência rápida de SQL'),
      ], [['Listas', [
        graded('tarefa', 'Lista 1 — DDL', { due: '2026-10-04T23:59', submitted: true, grade: 10, weight: 8 }),
        graded('tarefa', 'Lista 2 — DML', { due: '2026-10-18T23:59', submitted: true, grade: 9, weight: 8 }),
      ]]]),
      week('bd', 7, 'Junções e agregações.', [
        it('pptx', 'JOINs e GROUP BY'),
        graded('tarefa', 'Lista 3 — JOINs', { due: '2026-10-25T23:59', submitted: true, grade: 8, weight: 8, feedback: 'Atenção ao filtro de LEFT JOIN na questão 4.' }),
      ]),
      week('bd', 8, 'Subconsultas.', [
        it('pdf', 'Subconsultas correlacionadas'),
      ], [['EaD (2h)', [graded('tarefa', 'Lista 4 — subconsultas', {
        opens: '2026-10-27T18:40', due: '2026-11-04T23:59', submitted: false, grade: null, weight: 8,
        instructions: ['Resolva as 10 consultas da lista usando subconsultas (IN, EXISTS e subconsultas correlacionadas).', 'Envie um único arquivo .sql com os comandos comentados.'],
      })]]]),
      week('bd', 9, 'Índices e otimização de consultas.', [
        it('pptx', 'Índices: B-tree e hash'),
        graded('tarefa', 'Laboratório de índices', { opens: '2026-11-10T18:40', due: '2026-11-15T23:59', submitted: false, grade: null, weight: 10 }),
      ]),
      week('bd', 10, 'Projeto de banco de dados — entrega 1.', [], [['Projeto', [
        it('pagina', 'Enunciado do projeto de banco de dados'),
        graded('tarefa', 'Projeto — entrega 1: modelagem e script', { opens: '2026-11-01T00:00', due: '2026-11-22T23:59', submitted: false, grade: null, weight: 12 }),
      ]]]),
      week('bd', 11, 'Transações e controle de concorrência.', [it('pdf', 'Transações e ACID')]),
      week('bd', 12, 'Projeto de banco de dados — entrega final.', [
        graded('tarefa', 'Projeto — entrega final', { opens: '2026-11-23T00:00', due: '2026-12-06T23:59', submitted: false, grade: null, weight: 14 }),
      ]),
    ],
  });
})(typeof window !== 'undefined' ? window : this);
