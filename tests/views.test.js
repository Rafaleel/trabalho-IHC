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
