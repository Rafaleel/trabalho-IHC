/* Interação Humano-Computador — transcribed from the real Moodle course page (2026/2).
   Teacher and classmates are fictitious; no e-mails or private links. */
(function (root) {
  'use strict';
  var App = root.App;
  var n = 0;
  function it(type, title, extra) {
    n += 1;
    var o = { id: 'ihc-' + n, type: type, title: title };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  /* Graded item helper: submitted when its deadline is before "today". */
  function graded(type, title, extra) {
    var o = it(type, title, extra);
    o.graded = true;
    return o;
  }
  var TEACHER = 'Profa. Ana Ribeiro';

  App.data.courses.push({
    id: 'ihc',
    name: 'Interação Humano-Computador',
    shortName: 'IHC',
    code: 'CC',
    area: 'Design e UX',
    term: '2026/2',
    status: 'andamento',
    color: '#0b6b4b',
    teacher: { name: TEACHER },
    room: 'Sala A1-302 (Laboratório 03)',
    schedule: 'Segundas, 20:30–22:20',
    office: 'Segundas, 16:00–18:00, sala A1-229 (agendar pelo Google Chat)',
    workload: '60 h (2 créditos presenciais + 2 a distância)',
    lastAccess: '2026-11-07T21:40',
    favoriteByDefault: true,

    plan: {
      ementa: 'Fundamentos e paradigmas de interação humano-computador. Aspectos cognitivos, ergonômicos e sociais. Qualidade em IHC. Avaliação de interfaces. Processos e técnicas de design em IHC. Tópicos especiais em IHC.',
      objetivos: [
        'Compreender os fundamentos, paradigmas e estilos de interação entre pessoas e sistemas computacionais.',
        'Relacionar aspectos cognitivos, ergonômicos e sociais ao projeto de interfaces.',
        'Aplicar métodos de avaliação de usabilidade, como avaliação heurística, avaliação cooperativa e SUS.',
        'Conduzir um processo de design centrado no usuário, do problema ao protótipo de alta fidelidade.',
      ],
      conteudo: [
        'Fundamentos e paradigmas de IHC',
        'Aspectos cognitivos, ergonômicos e sociais',
        'Qualidade em IHC: usabilidade, experiência do usuário e acessibilidade',
        'Avaliação de interfaces: heurística, cooperativa e questionários',
        'Processos e técnicas de design em IHC',
        'Tópicos especiais em IHC',
      ],
      metodologia: 'Aulas presenciais expositivo-dialogadas com atividades práticas, complementadas por 2 créditos a distância no Moodle (leituras, vídeos, questionários e fóruns). Trabalho prático em grupo ao longo do semestre e portfólio reflexivo individual.',
      avaliacao: [
        { item: 'Atividades a distância (fóruns, questionários e tarefas)', peso: 30 },
        { item: 'Avaliação escrita', peso: 25 },
        { item: 'Trabalho prático em grupo', peso: 30 },
        { item: 'Seminário — Tópicos Especiais em IHC', peso: 15 },
      ],
      bibliografia: [
        'BARBOSA, S. D. J.; SILVA, B. S.; SILVEIRA, M. S. et al. Interação Humano-Computador e Experiência do Usuário. Autopublicação, 2021.',
        'NORMAN, D. A. O design do dia-a-dia. Rio de Janeiro: Rocco, 2006.',
        'ROGERS, Y.; SHARP, H.; PREECE, J. Design de interação: além da interação humano-computador. 3. ed. Porto Alegre: Bookman, 2013.',
        'NIELSEN, J. Usability Engineering. San Francisco: Morgan Kaufmann, 1993.',
      ],
    },

    notices: [
      { id: 'ihc-a1', title: 'Avaliação escrita na segunda, 09/11, sala A1-301', body: 'A avaliação escrita acontece no horário da aula, na sala A1-301. O conteúdo vai até "Processos e técnicas de design em IHC". Tragam caneta azul ou preta.', author: TEACHER, date: '2026-11-07T19:40' },
      { id: 'ihc-a2', title: 'Ordem das apresentações do trabalho prático', body: 'A ordem das apresentações de 16/11 já está publicada na semana de 16 a 22/11. Cada grupo terá de 8 a 12 minutos.', author: TEACHER, date: '2026-11-04T10:15' },
      { id: 'ihc-a3', title: 'Notas da Avaliação Heurística publicadas', body: 'As notas e os comentários da Avaliação Heurística de Usabilidade estão disponíveis na aba Notas.', author: TEACHER, date: '2026-10-28T17:02' },
      { id: 'ihc-a4', title: 'Atendimento extra antes da avaliação', body: 'Haverá atendimento extra na quinta-feira, 05/11, das 16h às 18h, na sala A1-229. Agendem pelo Google Chat.', author: TEACHER, date: '2026-10-20T09:30' },
    ],

    participants: App.data.makeParticipants(TEACHER, 0, 22, '2026-11-08T09:20'),

    events: [
      { date: '2026-11-09', time: '20:30', title: 'Avaliação escrita (sala A1-301)' },
      { date: '2026-11-16', time: '20:30', title: 'Apresentações do trabalho prático' },
      { date: '2026-12-07', time: '20:30', title: 'Seminário — Tópicos Especiais em IHC' },
    ],

    sections: [
      {
        id: 'ihc-s0',
        title: 'Geral',
        items: [
          it('forum', 'Avisos'),
          it('link', 'Avaliação (provisório)'),
          it('texto', 'Horários', {
            text: [
              '<strong>Aulas presenciais:</strong> segundas-feiras, 20:30–22:20, sala A1-302 (Laboratório 03).',
              '<strong>Atendimentos:</strong> segundas-feiras, 16:00 às 18:00, sala A1-229 (deve ser realizado agendamento prévio pelo Google Chat).',
              '<strong>Atenção:</strong> este componente curricular, além de 2 créditos presenciais, possui 2 créditos a distância. Portanto, fique atento(a) às atividades propostas no Moodle.',
            ],
          }),
          it('pdf', 'Interação Humano-Computador e Experiência do Usuário', {
            ref: 'BARBOSA, S., SILVA, B., SILVEIRA, M. S. et al. Interação Humano-Computador e Experiência do Usuário. Simone Diniz Junqueira, 2021.',
          }),
        ],
      },
      {
        id: 'ihc-s1',
        title: '17 a 23/08/2026',
        start: '2026-08-17', end: '2026-08-23',
        summary: 'Apresentação do Plano de Ensino. Semana de Acolhida Discente. Discussão do Plano de Ensino.',
        items: [it('arquivo', 'Plano de ensino (ajustado)')],
        subsections: [
          {
            id: 'ihc-s1-ead', title: 'EaD (2h)',
            items: [
              graded('forum', 'Discussão do Plano de Ensino', { due: '2026-08-23T23:59', submitted: true, grade: 10, weight: 3, feedback: 'Participação completa.' }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s2',
        title: '24 a 30/08/2026',
        start: '2026-08-24', end: '2026-08-30',
        summary: 'Avaliação Diagnóstica. Fundamentos e paradigmas de interação humano-computador. Aspectos cognitivos, ergonômicos e sociais.',
        items: [
          it('video', 'Crianças reagem a computadores antigos'),
          graded('forum', 'Avaliação Diagnóstica', { submitted: true, grade: 10, weight: 3, feedback: 'Obrigada pela participação.' }),
          it('video', 'O Futuro Realmente Chegou'),
          graded('forum', 'Modos e estilos de Interação', { submitted: true, grade: 9, weight: 4, feedback: 'Bons exemplos; faltou relacionar com os paradigmas.' }),
        ],
        subsections: [
          {
            id: 'ihc-s2-ead', title: 'EaD (2h)',
            items: [
              it('pptx', 'Fundamentos e paradigmas de interação humano-computador'),
              it('pdf', 'Fundamentos e paradigmas de interação humano-computador'),
              it('pdf', 'As frustrações da vida quotidiana', { ref: 'NORMAN, D. A. O design do dia-a-dia. Rio de Janeiro: Rocco, 2006. p. 26-28.' }),
              graded('tarefa', 'Fundamentos e paradigmas de Interação Humano-Computador', { opens: '2026-08-24T20:30', due: '2026-08-30T23:59', submitted: true, grade: 8.5, weight: 6, feedback: 'Boa síntese dos paradigmas.' }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s3',
        title: '31/08 a 13/09/2026',
        start: '2026-08-31', end: '2026-09-13',
        summary: 'Fundamentos e paradigmas de interação humano-computador. Aspectos cognitivos, ergonômicos e sociais.',
        items: [
          it('kahoot', 'Fundamentos da interação humano-computador'),
          graded('link', 'Linha do tempo', {
            submitted: true, grade: 9.5, weight: 5, feedback: 'Exemplo muito bem ilustrado.',
            instructions: [
              'Na linha do tempo, apresente um exemplo de interface de usuário, ilustrando-a e associando a ela as seguintes informações.',
              '<strong>Nome – ano</strong> e uma breve descrição.',
              '<strong>Paradigma:</strong> ex.: programação, linguagem de comando, menus hierárquicos e preenchimento de formulários, WIMP (Windows, Icons, Menus, Point devices), computação ubíqua, futuro…',
              '<strong>Perspectiva de interação:</strong> ex.: sistema, ferramenta, parceiro de discurso e mídia.',
              '<strong>Modo(s) de interação apoiado(s):</strong> ex.: instrução, conversação, manipulação, exploração etc.',
              '<strong>Estilo(s) de interação adotado(s):</strong> ex.: linguagem de comando, interação por menus, comandos acionados em voz, gestos, acionamento de botões, combinação de teclas de função, linguagem natural, manipulação direta, mundos 3D, sistemas de realidade aumentada e virtual etc.',
              '<strong>Fonte</strong> e <strong>autor(es)</strong>.',
            ],
          }),
        ],
        subsections: [
          {
            id: 'ihc-s3-ead', title: 'EaD (4h)',
            items: [
              it('pptx', 'Aspectos cognitivos, ergonômicos e sociais'),
              it('pdf', 'Aspectos cognitivos, ergonômicos e sociais'),
              it('link', 'Diagnóstico Semiótico: Rede de Combate à Violência Doméstica', {
                ref: 'Exemplo de diagnóstico semiótico produzido na UNIPAMPA (2026).',
              }),
              graded('questionario', 'Questionário', { due: '2026-09-13T23:59', submitted: true, grade: 8, weight: 4, feedback: '8 de 10 questões corretas.' }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s4',
        title: '14 a 20/09/2026',
        start: '2026-09-14', end: '2026-09-20',
        summary: 'Fundamentos e paradigmas de interação humano-computador. Aspectos cognitivos, ergonômicos e sociais.',
        items: [
          it('kahoot', 'Aspectos cognitivos, ergonômicos e sociais'),
          it('link', 'Simon – Exercício de Memória'),
          it('link', 'Quadro de Avaliação'),
          it('arquivo', 'Transcrição: Quadro de Avaliação "Influenciar a oferta de disciplinas"', {
            ref: 'Este arquivo JSON apresenta a transcrição dos dados do Quadro de Avaliação cujo preenchimento foi iniciado em sala de aula com auxílio de um pôster e post-its. Para visualizá-los, recomenda-se o uso do sistema web Quadro de Avaliação: salve o arquivo em seu computador e importe-o no sistema com a opção "Abrir Arquivo".',
          }),
        ],
        subsections: [
          {
            id: 'ihc-s4-ead', title: 'EaD (2h)',
            items: [
              graded('tarefa', 'Quadro de Avaliação', {
                opens: '2026-09-14T00:00', due: '2026-09-20T23:59', submitted: true, grade: 9, weight: 6, feedback: 'Problemas bem identificados em todos os níveis.',
                instructions: [
                  'Baixe a transcrição do Quadro de Avaliação para o problema focal "Influenciar a oferta de disciplinas". Então, atualize-o. Apresente, ao menos, duas questões/problemas para cada nível com suas respectivas ideias/soluções. Então, submeta-o aqui.',
                  'A atividade pode ser feita em duplas ou trios, mas todos devem submeter o arquivo individualmente.',
                ],
              }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s5',
        title: '21 a 27/09/2026',
        start: '2026-09-21', end: '2026-09-27',
        summary: 'Qualidade em IHC. Avaliação de interfaces.',
        items: [
          it('texto', 'Atividade: Avaliação de Usabilidade', { text: ['Avaliação Cooperativa', 'System Usability Scale (SUS)'] }),
          graded('pagina', 'Roteiro de Tarefas', { submitted: true, grade: 9, weight: 4, feedback: 'Tarefas claras e realistas.' }),
          graded('questionario', 'Questionário SUS (do inglês, System Usability Scale) – Site do Curso', { submitted: true, grade: 10, weight: 3, feedback: 'Respondido.' }),
          it('link', 'Teste de Usabilidade'),
          it('link', 'Usability (User) Testing 101'),
          it('link', 'Tradução e adaptação transcultural da system usability scale para o português do Brasil', {
            ref: 'Lourenço, Douglas Fabiano; Carmona, Elenice Valentim; Lopes, Maria Helena Baena de Moraes, 2023, "Instrucoes_escala_de_usabilidade_SUS.pdf", Tradução e adaptação transcultural da system usability scale para o português do Brasil, https://doi.org/10.25824/redu/CDS0XV, Repositório de Dados de Pesquisa da Unicamp, V1.',
          }),
          it('link', 'Calculadora SUS'),
        ],
        subsections: [
          {
            id: 'ihc-s5-ead', title: 'EaD (2h)',
            items: [
              graded('tarefa', 'Portfólio Reflexivo Individual (PRI)', {
                opens: '2026-09-21T00:00', due: '2026-09-28T00:00', submitted: true, grade: 9, weight: 8, feedback: 'Reflexões consistentes; aprofunde a seção 3.1.',
                instructions: [
                  'A atividade a distância desta semana, além da leitura dos materiais sobre Qualidade em IHC, envolve a organização e a submissão do Portfólio Reflexivo Individual (PRI) a partir do modelo disponibilizado. Para organizar e submeter seu PRI:',
                  'Faça uma cópia do modelo e complete com as informações de identificação (seção 1);',
                  'Complete as principais aprendizagens e/ou experiências (seção 2) para os tópicos "Fundamentos e paradigmas da interação humano-computador", "Aspectos cognitivos, ergonômicos e sociais" e "Qualidade em IHC";',
                  'Realize a atividade sobre "Heurísticas de Usabilidade de Nielsen" (subseção 3.1);',
                  'Compartilhe seu portfólio com a professora;',
                  'Finalmente, submeta o link como parte desta atividade.',
                ],
              }),
              it('link', 'Modelo: Portfólio Reflexivo Individual (PRI)'),
              it('pptx', 'Qualidade em IHC'),
              it('pdf', 'Qualidade em IHC'),
              it('kahoot', 'Qualidade em IHC'),
              it('video', 'Usability 101'),
              it('video', 'The 10 Usability Heuristics'),
              it('link', 'Usability 101: Introduction to Usability'),
              it('link', '10 Usability Heuristics for User Interface Design'),
              it('link', 'How to Conduct a Heuristic Evaluation'),
            ],
          },
        ],
      },
      {
        id: 'ihc-s6',
        title: '28/09 a 18/10/2026',
        start: '2026-09-28', end: '2026-10-18',
        summary: 'Qualidade em IHC. Avaliação de interfaces.',
        items: [
          it('texto', 'Atividade: Avaliação de Usabilidade', { text: ['Avaliação Heurística de Usabilidade'] }),
          graded('forum', 'Avaliação Heurística de Usabilidade', { submitted: true, grade: 8.5, weight: 8, feedback: 'Consolidação completa; algumas severidades superestimadas.' }),
          it('link', 'Avaliação Heurística de Usabilidade – Etapa 1: avaliação individual (material de apoio)'),
          it('link', 'How to Conduct a Heuristic Evaluation'),
        ],
        subsections: [
          {
            id: 'ihc-s6-ead', title: 'EaD (4h) + 2h/aula equivalentes à frequência do dia 05/10',
            items: [
              graded('questionario', 'Questionário', {
                due: '2026-10-18T23:59', submitted: true, grade: 9, weight: 4, feedback: '9 de 10 questões corretas.',
                instructions: ['Responder a este questionário equivale à frequência da aula do dia 05/10/2026, segunda-feira.'],
              }),
              graded('forum', 'Organização de grupos para o Trabalho Prático e Avaliação Heurística de Usabilidade', {
                due: '2026-10-18T23:59', submitted: true, grade: 10, weight: 4, feedback: 'Grupo e sistema registrados.',
                instructions: [
                  'Organizem-se em grupos de três a cinco integrantes, os mesmos grupos que irão desenvolver o Trabalho Prático. Então:',
                  'Delimitem um sistema de software que tenham interesse em avaliar e redesenhar;',
                  'Realizem, individualmente, a etapa 1 da Avaliação Heurística de Usabilidade do sistema de software;',
                  'Realizem, em grupo, a etapa 2, de consolidação da Avaliação Heurística de Usabilidade do sistema de software escolhido.',
                  'Um integrante de cada grupo deve submeter neste fórum: a identificação dos integrantes do grupo; a identificação do sistema de software escolhido; os links para as planilhas de cada avaliador; o link para a planilha com a consolidação da Avaliação Heurística de Usabilidade.',
                ],
              }),
              it('pdf', 'Avaliação de Interfaces'),
              it('link', 'Definição de Experiência do Usuário (UX)'),
              it('link', 'AMAWeb | Tornando a Web Acessível para Todos'),
            ],
          },
        ],
      },
      {
        id: 'ihc-s7',
        title: '19 a 25/10/2026',
        start: '2026-10-19', end: '2026-10-25',
        summary: 'Processos e técnicas de design em IHC. Desenvolvimento do Trabalho Prático.',
        items: [
          it('kahoot', 'Avaliação de Interfaces'),
          it('link', 'Trabalho Prático em Grupo (atividades, grupos e temas)'),
          it('arquivo', 'Do rabisco à tela em minutos, por Lucas Andrade'),
          it('link', 'Handbook of Human-Computer Interaction'),
          it('texto', 'Braindraw', {
            text: ['Trata-se de uma tempestade gráfica em rodízio para obter rapidamente ideias para o design de interface de usuário. Papéis e canetas são distribuídos entre os participantes, que formam um círculo. Cada participante inicia seu desenho. Ao final de um intervalo de tempo pré-definido (ex.: 45 segundos), cada participante entrega seu papel para o colega à sua esquerda, que continua a partir do que recebeu dentro do tempo pré-definido. As folhas passam entre os participantes até retornarem a quem iniciou o respectivo desenho ou até que todos fiquem satisfeitos. Como resultado, têm-se alternativas de design, geradas a partir de diferentes pontos de partida, para serem discutidas e ajudarem na consolidação de ideias.'],
          }),
        ],
        subsections: [
          {
            id: 'ihc-s7-ead', title: 'EaD (2h)',
            items: [
              it('pptx', 'Processos e técnicas de design em IHC'),
              it('pdf', 'Processos e técnicas de design em IHC'),
              graded('questionario', 'Questionário', { due: '2026-10-25T23:59', submitted: true, grade: 7.5, weight: 4, feedback: '7,5 de 10 questões corretas.' }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s8',
        title: '26/10 a 08/11/2026',
        start: '2026-10-26', end: '2026-11-08',
        highlight: true,
        summary: 'Processos e técnicas de design em IHC. Desenvolvimento do Trabalho Prático.',
        items: [it('link', 'Trabalho Prático em Grupo (continua)')],
        subsections: [
          {
            id: 'ihc-s8-ead', title: 'EaD (4h)',
            items: [
              graded('tarefa', 'Avaliação Cooperativa Planejamento', {
                opens: '2026-10-26T00:00', due: '2026-11-08T23:59', submitted: false, grade: null, weight: 12,
                instructions: [
                  'Um integrante do grupo do Trabalho Prático deve enviar:',
                  'O link para a versão inicial do protótipo funcional de alta fidelidade;',
                  'O roteiro de tarefas da Avaliação Cooperativa a ser realizada sobre a versão inicial do protótipo funcional de alta fidelidade.',
                  'Material de apoio disponível na seção "Trabalho Prático em Grupo".',
                ],
              }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s9',
        title: '09 a 15/11/2026',
        start: '2026-11-09', end: '2026-11-15',
        summary: 'Avaliação Escrita. Local: Sala A1-301. Processos e técnicas de design em IHC. Desenvolvimento do Trabalho Prático.',
        items: [],
        subsections: [
          {
            id: 'ihc-s9-ead', title: 'EaD (2h)',
            items: [
              it('link', 'Trabalho Prático em Grupo (continua)'),
              graded('tarefa', 'Apresentação do grupo', {
                opens: '2026-10-26T00:00', due: '2026-11-16T20:30', submitted: false, grade: null, weight: 12,
                instructions: [
                  'Os artefatos solicitados junto às orientações para o Trabalho Prático em Grupo devem ser organizados em uma apresentação a ser realizada para a turma (8 a 12 minutos). Além dos artefatos, são itens obrigatórios da apresentação:',
                  'Slide de título com a identificação do componente curricular, do projeto e dos integrantes do grupo;',
                  'Lições aprendidas;',
                  'Declaração de uso de Inteligência Artificial (ferramentas utilizadas e como foram utilizadas);',
                  'Referências.',
                ],
              }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s10',
        title: '16 a 22/11/2026',
        start: '2026-11-16', end: '2026-11-22',
        summary: 'Apresentação do Trabalho Prático à Turma. Local: Sala A1-301.',
        items: [
          it('texto', 'Apresentações do Trabalho Prático à turma', {
            text: ['<strong>20:30</strong> Página do Curso de CC da UNIPAMPA', '<strong>20:50</strong> Portal do Aluno', '<strong>21:10</strong> Moodle Institucional', '<strong>21:30</strong> Internet Archive'],
          }),
        ],
        subsections: [
          {
            id: 'ihc-s10-ead', title: 'EaD (2h)',
            items: [
              graded('tarefa', 'Atualização do Portfólio Reflexivo Individual (PRI)', {
                opens: '2026-10-26T00:00', due: '2026-11-22T23:59', submitted: false, grade: null, weight: 10,
                instructions: [
                  'A atividade a distância desta semana envolve a atualização do Portfólio Reflexivo Individual (PRI). Para fazê-lo:',
                  'Consolide a seção 2 com as principais aprendizagens e/ou experiências para cada tópico da ementa;',
                  'Realize a atividade sobre o "Trabalho Prático" (subseção 3.3), observando o enunciado abaixo;',
                  'Assinale os objetivos alcançados, enumerados na seção 4;',
                  'Complete a seção 5 "Desafios e/ou Dificuldades".',
                  'Caso não tenha feito a submissão na primeira oportunidade ou queira compartilhar um novo link, envie-o aqui.',
                  '<strong>3.3.1 Enunciado:</strong> aborde sua experiência no Trabalho Prático, realizado em grupo, abordando as principais aprendizagens desenvolvidas.',
                ],
              }),
            ],
          },
        ],
      },
      {
        id: 'ihc-s11',
        title: '23 a 29/11/2026',
        start: '2026-11-23', end: '2026-11-29',
        summary: 'Tópicos Especiais em IHC.',
        items: [],
        subsections: [{ id: 'ihc-s11-ead', title: 'EaD (2h)', items: [] }],
      },
      {
        id: 'ihc-s12',
        title: '30/11 a 06/12/2026',
        start: '2026-11-30', end: '2026-12-06',
        summary: 'Semana de TCC. Tópicos Especiais em IHC.',
        items: [],
        subsections: [{ id: 'ihc-s12-ead', title: 'EaD (2h) + 2h/aula equivalentes à frequência do dia 30/11', items: [] }],
      },
      {
        id: 'ihc-s13',
        title: '07/12/2026',
        start: '2026-12-07', end: '2026-12-17',
        summary: 'Avaliação: Seminário – Tópicos Especiais em IHC. Local: Sala A1-301.',
        items: [],
        subsections: [
          {
            id: 'ihc-s13-extra', title: '5h/aula equivalentes às frequências dos dias 14, 16 e 17/12',
            items: [
              it('texto', 'Encerramento', { text: ['Revisão do Portfólio Reflexivo Individual (PRI). Avaliação e autoavaliação do componente curricular. Revisão de notas e frequência.'] }),
            ],
          },
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : this);
