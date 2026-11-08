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
