'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, mkCtx } = require('./helpers');

const count = (html, re) => (html.match(re) || []).length;

test('shell: cabeçalho, navegação e menus', () => {
  const App = loadApp();
  const home = App.views.shell(mkCtx(App, '#/'), '<p>conteúdo</p>');
  assert.match(home, /<a[^>]*href="#\/"[^>]*aria-current="page"[^>]*>[\s\S]*?Página inicial/);
  for (const href of ['#/painel', '#/cursos', '#/calendario']) assert.match(home, new RegExp(`href="${href}"`));
  assert.equal(count(home, /aria-current="page"/g), 1);
  assert.match(home, /aria-expanded="false"/);
  assert.match(home, />RM</);
  assert.match(home, /logo-unipampa\.png/);

  const curso = App.views.shell(mkCtx(App, '#/curso/ihc'), '');
  assert.match(curso, /href="#\/cursos"[^>]*aria-current="page"/);

  const open = App.views.shell(mkCtx(App, '#/', { openMenu: 'notif' }), '');
  assert.match(open, /aria-expanded="true"/);
  assert.match(open, /Nova nota lançada em Banco de Dados/);
});

test('página não encontrada', () => {
  const App = loadApp();
  const ctx = mkCtx(App, '#/abc');
  const html = App.views.shell(ctx, App.views.notfound(ctx));
  assert.match(html, /Página não encontrada/);
  assert.match(html, /href="#\/cursos"/);
  assert.equal(count(html, /aria-current="page"/g), 0);
});

test('resolveView: rota e título', () => {
  const App = loadApp();
  const r = (h) => App.resolveView(mkCtx(App, h));
  assert.equal(r('#/abc').title, 'Página não encontrada');
  assert.equal(r('#/curso/naoexiste').title, 'Página não encontrada');
  assert.equal(r('#/curso/ihc').title, 'Interação Humano-Computador');
  assert.equal(r('#/').title, 'Página inicial');
});

test('ui: botões e etiquetas', () => {
  const { ui } = loadApp();
  assert.match(ui.btn({ label: 'Salvar', variant: 'primary' }), /^<button type="button" class="btn btn--primary btn--md"/);
  assert.match(ui.btn({ label: 'Plano', href: '#/x' }), /^<a href="#\/x" class="btn btn--secondary btn--md"/);
  assert.match(ui.btn({ icon: 'x', label: 'Fechar', iconOnly: true, size: 'sm' }), /aria-label="Fechar"/);
  assert.match(ui.statusTag('atrasada'), /tag--danger[^>]*>[\s\S]*Atrasada/);
  assert.match(ui.statusTag('entregue'), /tag--success/);
  assert.equal(ui.esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});

test('curso: aba Curso de IHC', () => {
  const App = loadApp();
  const html = App.views.curso(mkCtx(App, '#/curso/ihc'));
  assert.match(html, /Interação Humano-Computador/);
  assert.equal(count(html, /data-section-id=/g), 14);
  assert.match(html, /Esta semana/);
  assert.match(html, /href="#\/curso\/ihc\/plano"/);
  assert.match(html, /href="#\/curso\/ihc\/avisos"/);
  const iCal = html.indexOf('Calendário do curso');
  const iAv = html.indexOf('Avisos do professor');
  const iInfo = html.indexOf('Informações do curso');
  assert.ok(iCal > 0 && iCal < iAv && iAv < iInfo, 'ordem da barra lateral');
  assert.ok(!/\[(PDF|ATIVIDADE|KAHOOT|PPTX)\]/.test(html));
  assert.match(html, /Pendente/);
  assert.match(html, /Entregue/);
  assert.match(html, />14 de 17</);
  assert.match(html, /atividades entregues/);
  assert.match(html, /Próxima entrega/);
  // abas do curso
  for (const t of ['participantes', 'notas', 'atividades']) assert.match(html, new RegExp(`href="#/curso/ihc/${t}"`));
  assert.match(html, /href="#\/curso\/ihc"[^>]*aria-current="page"/);
  // seção atual aberta, seção antiga fechada por padrão
  assert.match(html, /data-section-id="ihc-s8"[^>]*aria-expanded="true"|aria-expanded="true"[^>]*data-section-id="ihc-s8"/);
  assert.match(html, /data-section-id="ihc-s2"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*data-section-id="ihc-s2"/);
  // calendário lateral marca dias com entrega
  assert.match(html, /novembro de 2026/);
  assert.match(html, /data-day="2026-11-08"[^>]*aria-current="date"|aria-current="date"[^>]*data-day="2026-11-08"/);
  assert.equal(count(html, /cal-mini__dot/g) >= 3, true);
});

test('curso: seções abertas por estado', () => {
  const App = loadApp();
  const html = App.views.curso(mkCtx(App, '#/curso/ihc', { openSections: { 'ihc-s2': true, 'ihc-s8': false } }));
  assert.match(html, /data-section-id="ihc-s2"[^>]*aria-expanded="true"|aria-expanded="true"[^>]*data-section-id="ihc-s2"/);
  assert.match(html, /data-section-id="ihc-s8"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*data-section-id="ihc-s8"/);
});

test('curso: todos os cursos renderizam', () => {
  const App = loadApp();
  for (const c of App.data.courses) {
    const html = App.views.curso(mkCtx(App, '#/curso/' + c.id));
    assert.match(html, new RegExp(c.name));
    assert.equal(count(html, /data-section-id=/g), c.sections.length, c.id);
  }
});

test('curso concluído', () => {
  const App = loadApp();
  const html = App.views.curso(mkCtx(App, '#/curso/alg'));
  assert.match(html, /Concluído/);
  assert.match(html, /Média final/);
  assert.match(html, /julho de 2026/);
});

test('plano de ensino e avisos', () => {
  const App = loadApp();
  const plano = App.views.curso(mkCtx(App, '#/curso/ihc/plano'));
  for (const s of ['Ementa', 'Objetivos', 'Conteúdo programático', 'Metodologia', 'Avaliação', 'Bibliografia']) assert.match(plano, new RegExp(s));
  assert.match(plano, /href="#\/curso\/ihc"/);
  const avisos = App.views.curso(mkCtx(App, '#/curso/ihc/avisos'));
  assert.equal(count(avisos, /class="notice"/g), 4);
});

test('abas Participantes, Notas e Atividades', () => {
  const App = loadApp();
  const p = App.views.participantes(mkCtx(App, '#/curso/ihc/participantes'));
  assert.match(p, /Profa\. Ana Ribeiro/);
  assert.match(p, /Rafael da Silva Moral/);
  assert.match(p, /href="#\/curso\/ihc\/participantes"[^>]*aria-current="page"/);
  assert.equal(count(p, /<tr class="person"/g), 24);
  const prof = App.views.participantes(mkCtx(App, '#/curso/ihc/participantes?papel=Professor(a)'));
  assert.equal(count(prof, /<tr class="person"/g), 1);
  const busca = App.views.participantes(mkCtx(App, '#/curso/ihc/participantes?q=rafael'));
  assert.ok(count(busca, /<tr class="person"/g) >= 1);
  assert.match(App.views.participantes(mkCtx(App, '#/curso/ihc/participantes?q=zzz')), /Nenhum participante/);

  const n = App.views.notas(mkCtx(App, '#/curso/ihc/notas'));
  assert.match(n, /Média parcial/);
  assert.match(n, /—/);
  assert.equal(count(n, /<tr class="grade-row/g), 17);
  assert.match(App.views.notas(mkCtx(App, '#/curso/calc/notas')), /Média final/);

  const a = App.views.atividades(mkCtx(App, '#/curso/bd/atividades'));
  const iA = a.indexOf('Atrasadas'), iP = a.indexOf('Próximas'), iC = a.indexOf('Concluídas');
  assert.ok(iA > 0 && iA < iP && iP < iC, 'grupos na ordem');
  assert.match(App.views.atividades(mkCtx(App, '#/curso/ihc/atividades?situacao=zzz')), /Nenhuma atividade/);
  const soTarefas = App.views.atividades(mkCtx(App, '#/curso/ihc/atividades?tipo=forum'));
  assert.ok(!/Avaliação Cooperativa Planejamento/.test(soTarefas));
  assert.match(soTarefas, /Discussão do Plano de Ensino/);
  assert.equal(App.resolveView(mkCtx(App, '#/curso/ihc/notas')).title, 'Interação Humano-Computador');
});

test('meus cursos: filtro', () => {
  const App = loadApp();
  const html = App.views.cursos(mkCtx(App, '#/cursos'));
  assert.equal(count(html, /class="course-card[ "]/g), 5);
  assert.match(html, /aria-pressed="true"[^>]*aria-label="Remover .* dos favoritos"|aria-label="Remover .* dos favoritos"[^>]*aria-pressed="true"/);
  assert.match(html, /id="course-results"/);
  assert.match(html, /data-input="course-search"/);
  assert.match(html, /<strong>5<\/strong> cursos/);
  assert.ok(!/filtros? ativos?/.test(html.match(/<div id="course-results"[\s\S]*/)[0].slice(0, 400)), 'sem contador quando não há filtro');
  for (const c of ['ihc', 'web', 'bd', 'ia', 'pi']) assert.match(html, new RegExp(`href="#/curso/${c}"`));

  const r = App.views.cursosResults(mkCtx(App, '#/cursos?q=zzz&fav=1'));
  assert.match(r, /Nenhum curso encontrado/);
  assert.match(r, /2 filtros ativos/);
  assert.match(r, /data-action="clear-filters"/);
  assert.match(App.views.cursosResults(mkCtx(App, '#/cursos?status=concluido')), /Algoritmos e Programação/);
  assert.match(App.views.cursosResults(mkCtx(App, '#/cursos?status=concluido')), /Concluído/);
  const lista = App.views.cursos(mkCtx(App, '#/cursos', { view: 'lista' }));
  assert.match(lista, /course-grid--list/);
  // área e ordenação vêm da URL
  const area = App.views.cursosResults(mkCtx(App, '#/cursos?area=Dados'));
  assert.equal(count(area, /class="course-card[ "]/g), 1);
  const ord = App.views.cursosResults(mkCtx(App, '#/cursos?ordem=entrega'));
  assert.ok(ord.indexOf('/curso/ihc"') < ord.indexOf('/curso/web"'));
  assert.equal(App.resolveView(mkCtx(App, '#/cursos')).title, 'Meus cursos');
});

test('página inicial, painel e calendário', () => {
  const App = loadApp();
  const h = App.views.home(mkCtx(App, '#/'));
  assert.match(h, /Olá, Rafael/);
  assert.equal(count(h, /class="site-notice"/g), 3);
  for (const c of ['ihc', 'web', 'bd', 'ia', 'pi']) assert.match(h, new RegExp(`href="#/curso/${c}"`));
  assert.match(h, /href="#\/painel"/);

  const p = App.views.painel(mkCtx(App, '#/painel'));
  assert.match(p, /Linha do tempo/);
  assert.match(p, /Avaliação Cooperativa Planejamento/);
  assert.match(p, /Acessados recentemente/);
  assert.match(p, /href="#\/calendario"/);
  assert.match(p, /Hoje/);
  const late = App.views.painel(mkCtx(App, '#/painel', { painelRange: 'atrasadas' }));
  assert.match(late, /Lista 4 — subconsultas/);
  assert.ok(!/Avaliação Cooperativa Planejamento<\/a>/.test(late.split('Acessados recentemente')[0]));
  const p30 = App.views.painel(mkCtx(App, '#/painel', { painelRange: 30 }));
  assert.match(p30, /Projeto final — relatório e código/);

  const c = App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11'));
  assert.match(c, /novembro de 2026/);
  assert.equal(count(c, /data-cal-day=/g), 42);
  assert.match(App.views.calendario(mkCtx(App, '#/calendario?mes=2027-01')), /janeiro de 2027/);
  assert.match(App.views.calendario(mkCtx(App, '#/calendario')), /novembro de 2026/);
  assert.match(App.views.calendario(mkCtx(App, '#/calendario?mes=xx')), /novembro de 2026/);
  const web = App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11&curso=web'));
  assert.match(web, /Sprint 3 — formulário de inscrição validado/);
  assert.ok(!/Avaliação Cooperativa/.test(web));
  const dia = App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11&dia=2026-11-16'));
  assert.match(dia, /segunda-feira, 16 de novembro/);
  assert.match(dia, /Apresentação do grupo/);
  for (const v of ['Página inicial', 'Painel', 'Calendário']) assert.ok(App.resolveView(mkCtx(App, { 'Página inicial': '#/', Painel: '#/painel', 'Calendário': '#/calendario' }[v])).title === v);
});
