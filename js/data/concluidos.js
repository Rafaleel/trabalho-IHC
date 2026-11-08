/* Courses finished in semester 2026/1 — fictitious, everything submitted and graded. */
(function (root) {
  'use strict';
  var D = root.App.data;

  function section(prefix, n, title, start, end, summary, items, subsections) {
    var s = { id: prefix + '-s' + n, title: title, start: start, end: end, summary: summary, items: items };
    if (subsections) s.subsections = subsections.map(function (sub, i) { return { id: s.id + '-' + (i + 1), title: sub[0], items: sub[1] }; });
    return s;
  }

  (function () {
    var f = D.factory('alg');
    var it = f.it, graded = f.graded;
    var T = 'Prof. Rodrigo Sales';
    D.courses.push({
      id: 'alg',
      name: 'Algoritmos e Programação',
      shortName: 'AP',
      code: 'CC',
      area: 'Programação',
      term: '2026/1',
      status: 'concluido',
      color: '#2d7f86',
      teacher: { name: T },
      room: 'Lab A1-301',
      schedule: 'Segundas, 18:40–20:20',
      office: 'Segundas, 17:00–18:30, sala A1-210',
      workload: '60 h (4 créditos presenciais)',
      lastAccess: '2026-07-12T16:20',
      favoriteByDefault: false,
      plan: {
        ementa: 'Algoritmos e lógica de programação. Variáveis, tipos e operadores. Estruturas condicionais e de repetição. Vetores, matrizes e funções. Introdução a Python.',
        objetivos: ['Desenvolver o raciocínio lógico para resolução de problemas.', 'Implementar algoritmos estruturados em Python.'],
        conteudo: ['Lógica e algoritmos', 'Condicionais', 'Repetição', 'Vetores e matrizes', 'Funções'],
        metodologia: 'Aulas práticas em laboratório com listas semanais.',
        avaliacao: [{ item: 'Listas de exercícios', peso: 40 }, { item: 'Provas práticas', peso: 60 }],
        bibliografia: ['MENEZES, N. N. C. Introdução à programação com Python. 3. ed. São Paulo: Novatec, 2019.'],
      },
      notices: [
        { id: 'alg-a1', title: 'Notas finais publicadas', body: 'As notas finais do semestre estão disponíveis na aba Notas. Bom descanso!', author: T, date: '2026-07-10T18:00' },
        { id: 'alg-a2', title: 'Revisão para a prova prática 2', body: 'Teremos revisão na segunda, 22/06, no horário da aula.', author: T, date: '2026-06-17T09:00' },
      ],
      participants: D.makeParticipants(T, 2, 24, '2026-07-10T18:05'),
      events: [],
      sections: [
        { id: 'alg-s0', title: 'Geral', items: [it('forum', 'Avisos'), it('pdf', 'Guia de instalação do Python')] },
        section('alg', 1, '09 a 29/03/2026', '2026-03-09', '2026-03-29', 'Lógica e algoritmos.', [
          it('pptx', 'Introdução a algoritmos'),
          graded('tarefa', 'Lista 1 — sequenciais', { due: '2026-03-29T23:59', submitted: true, grade: 10, weight: 10 }),
        ]),
        section('alg', 2, '30/03 a 26/04/2026', '2026-03-30', '2026-04-26', 'Estruturas condicionais.', [
          graded('tarefa', 'Lista 2 — condicionais', { due: '2026-04-26T23:59', submitted: true, grade: 9, weight: 10 }),
        ], [['Prova', [graded('tarefa', 'Prova prática 1', { due: '2026-04-27T20:20', submitted: true, grade: 8, weight: 30 })]]]),
        section('alg', 3, '27/04 a 24/05/2026', '2026-04-27', '2026-05-24', 'Estruturas de repetição.', [
          it('video', 'Laços em Python'),
          graded('tarefa', 'Lista 3 — repetição', { due: '2026-05-24T23:59', submitted: true, grade: 9.5, weight: 10 }),
        ]),
        section('alg', 4, '25/05 a 21/06/2026', '2026-05-25', '2026-06-21', 'Vetores, matrizes e funções.', [
          graded('tarefa', 'Lista 4 — vetores e funções', { due: '2026-06-21T23:59', submitted: true, grade: 8.5, weight: 10 }),
        ]),
        section('alg', 5, '22/06 a 10/07/2026', '2026-06-22', '2026-07-10', 'Prova prática 2 e encerramento.', [
          graded('tarefa', 'Prova prática 2', { due: '2026-07-06T20:20', submitted: true, grade: 8.8, weight: 30 }),
        ]),
      ],
    });
  })();

  (function () {
    var f = D.factory('calc');
    var it = f.it, graded = f.graded;
    var T = 'Profa. Beatriz Lemos';
    D.courses.push({
      id: 'calc',
      name: 'Cálculo I',
      shortName: 'Cálculo',
      code: 'CC',
      area: 'Matemática',
      term: '2026/1',
      status: 'concluido',
      color: '#8a6d3b',
      teacher: { name: T },
      room: 'Sala B1-110',
      schedule: 'Terças e quintas, 18:40–20:20',
      office: 'Quintas, 17:00–18:30, sala B1-204',
      workload: '90 h (6 créditos presenciais)',
      lastAccess: '2026-07-09T21:10',
      favoriteByDefault: false,
      plan: {
        ementa: 'Funções reais de uma variável. Limites e continuidade. Derivadas e aplicações. Introdução à integral.',
        objetivos: ['Calcular limites e derivadas de funções reais.', 'Aplicar derivadas a problemas de taxa de variação e otimização.'],
        conteudo: ['Funções', 'Limites', 'Continuidade', 'Derivadas', 'Aplicações da derivada', 'Integral indefinida'],
        metodologia: 'Aulas expositivas com listas de exercícios e monitoria.',
        avaliacao: [{ item: 'Listas', peso: 20 }, { item: 'Provas', peso: 80 }],
        bibliografia: ['STEWART, J. Cálculo. v. 1. 8. ed. São Paulo: Cengage, 2017.'],
      },
      notices: [
        { id: 'calc-a1', title: 'Resultado final disponível', body: 'Confiram a média final na aba Notas.', author: T, date: '2026-07-09T20:00' },
        { id: 'calc-a2', title: 'Monitoria extra antes da P2', body: 'Monitoria extra na quarta, 01/07, das 14h às 17h, sala B1-110.', author: T, date: '2026-06-26T12:00' },
      ],
      participants: D.makeParticipants(T, 7, 26, '2026-07-09T20:05'),
      events: [],
      sections: [
        { id: 'calc-s0', title: 'Geral', items: [it('forum', 'Avisos'), it('pdf', 'Formulário de derivadas')] },
        section('calc', 1, '09/03 a 05/04/2026', '2026-03-09', '2026-04-05', 'Funções e limites.', [
          it('pdf', 'Notas de aula — limites'),
          graded('tarefa', 'Lista 1 — limites', { due: '2026-04-05T23:59', submitted: true, grade: 8, weight: 5 }),
        ]),
        section('calc', 2, '06/04 a 03/05/2026', '2026-04-06', '2026-05-03', 'Continuidade e derivadas.', [
          graded('tarefa', 'Lista 2 — derivadas', { due: '2026-05-03T23:59', submitted: true, grade: 7.5, weight: 5 }),
        ], [['Prova', [graded('tarefa', 'Prova 1', { due: '2026-05-05T20:20', submitted: true, grade: 7, weight: 40 })]]]),
        section('calc', 3, '04/05 a 07/06/2026', '2026-05-04', '2026-06-07', 'Aplicações da derivada.', [
          graded('tarefa', 'Lista 3 — otimização', { due: '2026-06-07T23:59', submitted: true, grade: 9, weight: 5 }),
        ]),
        section('calc', 4, '08/06 a 28/06/2026', '2026-06-08', '2026-06-28', 'Integral indefinida.', [
          graded('tarefa', 'Lista 4 — integrais', { due: '2026-06-28T23:59', submitted: true, grade: 8, weight: 5 }),
        ]),
        section('calc', 5, '29/06 a 10/07/2026', '2026-06-29', '2026-07-10', 'Prova 2 e encerramento.', [
          graded('tarefa', 'Prova 2', { due: '2026-07-02T20:20', submitted: true, grade: 8, weight: 40 }),
        ]),
      ],
    });
  })();
})(typeof window !== 'undefined' ? window : this);
