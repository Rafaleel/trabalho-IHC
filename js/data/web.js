/* Desenvolvimento Web Responsivo — fictitious course. */
(function (root) {
  'use strict';
  var D = root.App.data;
  var f = D.factory('web');
  var it = f.it, graded = f.graded, week = D.week;
  var T = 'Prof. Marcelo Teixeira';

  D.courses.push({
    id: 'web',
    name: 'Desenvolvimento Web Responsivo',
    shortName: 'Web',
    code: 'CC',
    area: 'Programação',
    term: '2026/2',
    status: 'andamento',
    color: '#2f6fed',
    teacher: { name: T },
    room: 'Lab B2-105',
    schedule: 'Quartas, 20:30–22:20',
    office: 'Quartas, 18:00–19:30, sala B2-210',
    workload: '60 h (4 créditos presenciais)',
    lastAccess: '2026-11-06T22:05',
    favoriteByDefault: false,

    plan: {
      ementa: 'Estrutura semântica de documentos HTML. Folhas de estilo e layout com Flexbox e Grid. Design responsivo e mobile-first. JavaScript no navegador: DOM, eventos e validação de formulários. Acessibilidade e desempenho na web.',
      objetivos: [
        'Construir páginas web semânticas, acessíveis e responsivas.',
        'Dominar técnicas modernas de layout com CSS Flexbox e Grid.',
        'Manipular o DOM e tratar eventos com JavaScript.',
        'Organizar interfaces em componentes reutilizáveis.',
      ],
      conteudo: ['HTML semântico', 'CSS: box model, seletores e cascata', 'Flexbox e Grid', 'Design responsivo e media queries', 'JavaScript e DOM', 'Formulários e validação', 'Acessibilidade web (WCAG)', 'Projeto final'],
      metodologia: 'Aulas práticas em laboratório, com exercícios semanais e um projeto desenvolvido em sprints.',
      avaliacao: [
        { item: 'Exercícios e questionários', peso: 35 },
        { item: 'Sprints do projeto', peso: 37 },
        { item: 'Projeto final', peso: 13 },
        { item: 'Participação e revisão por pares', peso: 15 },
      ],
      bibliografia: [
        'MARCOTTE, E. Responsive Web Design. 2. ed. A Book Apart, 2014.',
        'FLANAGAN, D. JavaScript: o guia definitivo. 7. ed. Porto Alegre: Bookman, 2022.',
        'W3C. Web Content Accessibility Guidelines (WCAG) 2.2, 2023.',
      ],
    },

    notices: [
      { id: 'web-a1', title: 'Sprint 3 liberada: formulário validado', body: 'O enunciado da Sprint 3 está na semana de 09 a 15/11. O prazo é domingo, 15/11, às 23:59.', author: T, date: '2026-11-02T08:30' },
      { id: 'web-a2', title: 'Aula de 11/11 será de dúvidas', body: 'Usaremos a aula de quarta para tirar dúvidas da Sprint 3. Tragam o projeto rodando no notebook.', author: T, date: '2026-11-06T17:45' },
      { id: 'web-a3', title: 'Feedback da Sprint 2 publicado', body: 'Os comentários de cada grupo estão na aba Notas.', author: T, date: '2026-10-29T12:10' },
    ],

    participants: D.makeParticipants(T, 4, 18, '2026-11-07T20:10'),
    events: [{ date: '2026-11-11', time: '20:30', title: 'Aula de dúvidas da Sprint 3' }],

    sections: [
      {
        id: 'web-s0', title: 'Geral',
        items: [
          it('forum', 'Avisos'),
          it('texto', 'Horários', { text: ['<strong>Aulas:</strong> quartas-feiras, 20:30–22:20, Lab B2-105.', '<strong>Atendimento:</strong> quartas-feiras, 18:00–19:30, sala B2-210.'] }),
          it('link', 'Repositório de exemplos da disciplina'),
          it('pdf', 'Guia de configuração do ambiente (VS Code e Live Server)'),
        ],
      },
      week('web', 1, 'Apresentação da disciplina. Como a web funciona.', [
        it('pptx', 'Apresentação da disciplina'),
        graded('forum', 'Apresente-se e conte que sites você usa todo dia', { due: '2026-08-23T23:59', submitted: true, grade: 10, weight: 2 }),
      ]),
      week('web', 2, 'HTML semântico.', [
        it('pdf', 'HTML semântico: estrutura de documentos'),
        it('video', 'Por que a semântica importa'),
      ], [['Atividade', [graded('tarefa', 'Página pessoal em HTML semântico', { opens: '2026-08-24T20:30', due: '2026-08-30T23:59', submitted: true, grade: 9, weight: 8, feedback: 'Boa estrutura; revise a hierarquia de títulos.' })]]]),
      week('web', 3, 'CSS: box model, seletores e cascata.', [
        it('pptx', 'Fundamentos de CSS'),
        it('link', 'MDN — Introdução ao CSS'),
        graded('questionario', 'Questionário: box model', { due: '2026-09-13T23:59', submitted: true, grade: 8, weight: 5 }),
      ]),
      week('web', 4, 'Layout com Flexbox.', [
        it('pdf', 'Guia visual de Flexbox'),
        it('link', 'Flexbox Froggy'),
      ], [['EaD (2h)', [graded('tarefa', 'Layout de cartões com Flexbox', { opens: '2026-09-14T20:30', due: '2026-09-20T23:59', submitted: true, grade: 9.5, weight: 10, feedback: 'Excelente uso de gap e alinhamento.' })]]]),
      week('web', 5, 'CSS Grid.', [
        it('pptx', 'CSS Grid na prática'),
        graded('tarefa', 'Grid responsivo de galeria', { opens: '2026-09-21T20:30', due: '2026-09-27T23:59', submitted: true, grade: 8.5, weight: 10, feedback: 'Faltou testar em 360 px.' }),
      ]),
      week('web', 6, 'Design responsivo e mobile-first. Sprint 1.', [
        it('pdf', 'Mobile-first: estratégia e media queries'),
        graded('questionario', 'Questionário: media queries', { due: '2026-10-18T23:59', submitted: true, grade: 9, weight: 5 }),
      ], [['Sprint 1', [
        it('pagina', 'Enunciado da Sprint 1 — landing page'),
        graded('tarefa', 'Sprint 1 — landing page responsiva', { opens: '2026-09-28T20:30', due: '2026-10-18T23:59', submitted: true, grade: 8.5, weight: 12, feedback: 'Boa landing page; melhore o contraste dos botões.' }),
      ]]]),
      week('web', 7, 'Revisão por pares.', [
        graded('forum', 'Revisão por pares da Sprint 1', { due: '2026-10-25T23:59', submitted: true, grade: 10, weight: 5 }),
        it('link', 'Checklist de revisão de código front-end'),
      ]),
      week('web', 8, 'JavaScript e DOM. Sprint 2: biblioteca de componentes.', [
        it('pptx', 'JavaScript no navegador: DOM e eventos'),
        it('video', 'Manipulando o DOM sem frameworks'),
      ], [['Sprint 2', [graded('tarefa', 'Sprint 2 — biblioteca de componentes', { opens: '2026-10-26T20:30', due: '2026-11-01T23:59', submitted: true, grade: 9, weight: 12, feedback: 'Componentes consistentes; documente os estados.' })]]]),
      week('web', 9, 'Formulários e validação. Sprint 3.', [
        it('pdf', 'Validação de formulários: nativa e com JavaScript'),
        it('link', 'Padrões de mensagens de erro acessíveis'),
      ], [['Sprint 3', [
        it('pagina', 'Enunciado da Sprint 3 — formulário validado'),
        graded('tarefa', 'Sprint 3 — formulário de inscrição validado', {
          opens: '2026-11-02T08:00', due: '2026-11-15T23:59', submitted: false, grade: null, weight: 13,
          instructions: ['Implemente o formulário de inscrição do evento com validação em tempo real.', 'Mensagens de erro devem aparecer junto ao campo e ser anunciadas por leitores de tela.', 'Envie o link do repositório e da página publicada.'],
        }),
      ]]]),
      week('web', 10, 'Acessibilidade web.', [
        it('link', 'WCAG 2.2 — visão geral'),
        graded('questionario', 'Questionário: acessibilidade web', { opens: '2026-11-16T00:00', due: '2026-11-22T23:59', submitted: false, grade: null, weight: 5 }),
      ]),
      week('web', 11, 'Desempenho e boas práticas.', [it('pptx', 'Desempenho na web: imagens, fontes e carregamento')]),
      week('web', 12, 'Projeto final.', [], [['Entrega', [
        graded('tarefa', 'Projeto final — site responsivo completo', { opens: '2026-11-09T00:00', due: '2026-12-06T23:59', submitted: false, grade: null, weight: 13 }),
      ]]]),
    ],
  });
})(typeof window !== 'undefined' ? window : this);
