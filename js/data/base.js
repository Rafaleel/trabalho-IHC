/* Global prototype data. Every name here is fictitious except the logged-in student. */
(function (root) {
  'use strict';
  var App = (root.App = root.App || {});

  App.data = {
    today: '2026-11-08T12:00',
    user: { name: 'Rafael da Silva Moral', firstName: 'Rafael', initials: 'RM' },

    TYPE_META: {
      pdf: { label: 'PDF', icon: 'file-text', tone: 'file' },
      pptx: { label: 'PPTX', icon: 'presentation', tone: 'file' },
      arquivo: { label: 'Arquivo', icon: 'file', tone: 'file' },
      video: { label: 'Vídeo', icon: 'play', tone: 'link' },
      link: { label: 'Link', icon: 'link', tone: 'link' },
      kahoot: { label: 'Kahoot', icon: 'gamepad', tone: 'link' },
      forum: { label: 'Fórum', icon: 'messages', tone: 'forum' },
      pagina: { label: 'Página', icon: 'file-lines', tone: 'page' },
      tarefa: { label: 'Tarefa', icon: 'upload', tone: 'task' },
      questionario: { label: 'Questionário', icon: 'list-checks', tone: 'task' },
      texto: { label: '', icon: '', tone: 'text' },
    },

    siteNotices: [
      {
        id: 'sn1',
        title: 'Calendário acadêmico: fim do 2º semestre em 19/12',
        body: 'O último dia letivo do semestre 2026/2 é 19 de dezembro. Os lançamentos de notas finais encerram em 23/12.',
        date: '2026-11-05T09:00',
      },
      {
        id: 'sn2',
        title: 'Semana de TCC do curso de Ciência da Computação',
        body: 'Entre 30/11 e 04/12 acontecem as defesas de TCC. Algumas aulas presenciais serão substituídas por atividades a distância.',
        date: '2026-11-03T14:30',
      },
      {
        id: 'sn3',
        title: 'Manutenção programada do Moodle',
        body: 'No sábado, 14/11, das 22h às 2h, o ambiente pode ficar indisponível para atualização do sistema.',
        date: '2026-10-30T18:00',
      },
    ],

    notifications: [
      { id: 'n1', text: 'Nova nota lançada em Banco de Dados: Lista 3 de SQL', time: '2026-11-08T09:12' },
      { id: 'n2', text: 'Novo aviso em Interação Humano-Computador', time: '2026-11-07T19:40' },
      { id: 'n3', text: 'Prazo próximo: Avaliação Cooperativa Planejamento vence hoje às 23:59', time: '2026-11-07T08:00' },
      { id: 'n4', text: 'Seu envio em Projeto Integrador foi avaliado', time: '2026-11-05T16:20' },
    ],

    messages: [
      { id: 'm1', from: 'Júlia Fernandes', preview: 'Rafael, consegue revisar o roteiro de tarefas hoje?', time: '2026-11-08T10:05' },
      { id: 'm2', from: 'Grupo — Trabalho Prático IHC', preview: 'Bruno: subi a versão nova do protótipo no Figma.', time: '2026-11-07T22:31' },
      { id: 'm3', from: 'Prof. Marcelo Teixeira', preview: 'Recebi seu e-mail, conversamos na aula de quarta.', time: '2026-11-04T15:47' },
    ],

    peoplePool: [
      'Ana Clara Rocha', 'Bruno Carvalho', 'Camila Duarte', 'Daniel Pereira', 'Eduarda Lima',
      'Felipe Moreira', 'Gabriela Souza', 'Henrique Alves', 'Isabela Martins', 'João Pedro Ramos',
      'Júlia Fernandes', 'Kauã Oliveira', 'Larissa Gomes', 'Lucas Andrade', 'Mariana Costa',
      'Matheus Ribeiro', 'Natália Barbosa', 'Otávio Mendes', 'Paula Cardoso', 'Pedro Henrique Silva',
      'Rafaela Nunes', 'Renan Teixeira', 'Sabrina Freitas', 'Thiago Moura', 'Valentina Campos',
      'Vinícius Azevedo', 'Yasmin Correia', 'Igor Batista', 'Letícia Pires', 'Gustavo Rezende',
    ],

    courses: [],
  };

  /* Item factory for course files: ids are "<prefix>-<n>". */
  App.data.factory = function (prefix) {
    var n = 0;
    function it(type, title, extra) {
      n += 1;
      var o = { id: prefix + '-' + n, type: type, title: title };
      for (var k in extra || {}) o[k] = extra[k];
      return o;
    }
    function graded(type, title, extra) {
      var o = it(type, title, extra);
      o.graded = true;
      return o;
    }
    return { it: it, graded: graded };
  };

  /* Week ranges of semester 2026/2 (same as the real IHC course). */
  var WEEKS = [
    ['17 a 23/08/2026', '2026-08-17', '2026-08-23'],
    ['24 a 30/08/2026', '2026-08-24', '2026-08-30'],
    ['31/08 a 13/09/2026', '2026-08-31', '2026-09-13'],
    ['14 a 20/09/2026', '2026-09-14', '2026-09-20'],
    ['21 a 27/09/2026', '2026-09-21', '2026-09-27'],
    ['28/09 a 18/10/2026', '2026-09-28', '2026-10-18'],
    ['19 a 25/10/2026', '2026-10-19', '2026-10-25'],
    ['26/10 a 08/11/2026', '2026-10-26', '2026-11-08'],
    ['09 a 15/11/2026', '2026-11-09', '2026-11-15'],
    ['16 a 22/11/2026', '2026-11-16', '2026-11-22'],
    ['23 a 29/11/2026', '2026-11-23', '2026-11-29'],
    ['30/11 a 06/12/2026', '2026-11-30', '2026-12-06'],
    ['07/12/2026', '2026-12-07', '2026-12-17'],
  ];
  /* Builds a week section. `w` is 1-based; the week containing "today" gets highlight. */
  App.data.week = function (prefix, w, summary, items, subsections) {
    var r = WEEKS[w - 1];
    var s = { id: prefix + '-s' + w, title: r[0], start: r[1], end: r[2], summary: summary, items: items || [] };
    if (subsections) s.subsections = subsections.map(function (sub, i) { return { id: s.id + '-' + (i + 1), title: sub[0], items: sub[1] }; });
    if (r[1] <= App.data.today.slice(0, 10) && r[2] >= App.data.today.slice(0, 10)) s.highlight = true;
    return s;
  };

  /* Builds a participant list: teacher + student + `count` classmates taken from the pool. */
  App.data.makeParticipants = function (teacherName, offset, count, lastAccessBase) {
    var pool = App.data.peoplePool;
    var list = [{ name: teacherName, role: 'Professor(a)', lastAccess: lastAccessBase }];
    list.push({ name: App.data.user.name, role: 'Estudante', lastAccess: '2026-11-08T11:48' });
    for (var i = 0; i < count; i++) {
      var day = 8 - (i % 6);
      var hour = 8 + ((i * 5) % 14);
      list.push({
        name: pool[(offset + i) % pool.length],
        role: 'Estudante',
        lastAccess: '2026-11-0' + day + 'T' + String(hour).padStart(2, '0') + ':' + String((i * 17) % 60).padStart(2, '0'),
      });
    }
    return list;
  };
})(typeof window !== 'undefined' ? window : this);
