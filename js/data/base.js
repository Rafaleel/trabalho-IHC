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
