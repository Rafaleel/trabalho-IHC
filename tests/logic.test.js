'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const L = () => loadApp(['js/logic.js']).logic;
const plain = (o) => JSON.parse(JSON.stringify(o));

test('parseRoute', () => {
  const { parseRoute } = L();
  assert.equal(parseRoute('').name, 'home');
  assert.equal(parseRoute('#/').name, 'home');
  assert.equal(parseRoute('#').name, 'home');
  assert.deepEqual(plain(parseRoute('#/curso/ihc')), { name: 'curso', params: { id: 'ihc', tab: 'curso' }, query: {} });
  assert.equal(parseRoute('#/curso/ihc/notas').params.tab, 'notas');
  assert.equal(parseRoute('#/curso/ihc/plano').params.tab, 'plano');
  assert.equal(parseRoute('#/curso/ihc/foo').name, 'notfound');
  assert.equal(parseRoute('#/curso').name, 'notfound');
  assert.equal(parseRoute('#/abc').name, 'notfound');
  assert.equal(parseRoute('#/painel').name, 'painel');
  assert.equal(parseRoute('#/calendario').name, 'calendario');
  assert.deepEqual(plain(parseRoute('#/cursos?q=web&fav=1').query), { q: 'web', fav: '1' });
});

test('buildHash round-trip', () => {
  const { parseRoute, buildHash } = L();
  const h = buildHash('cursos', {}, { q: 'banco de dados', status: 'todos' });
  assert.deepEqual(plain(parseRoute(h).query), { q: 'banco de dados', status: 'todos' });
  assert.equal(buildHash('curso', { id: 'ihc', tab: 'curso' }), '#/curso/ihc');
  assert.equal(buildHash('curso', { id: 'ihc', tab: 'notas' }), '#/curso/ihc/notas');
  assert.equal(buildHash('home'), '#/');
  assert.equal(buildHash('cursos', {}, { q: '', fav: undefined }), '#/cursos');
});

test('datas', () => {
  const l = L();
  assert.equal(l.norm('  Interação   HUMANO '), 'interacao humano');
  assert.equal(l.toKey(l.parseDate('2026-08-30T23:59')), '2026-08-30');
  assert.equal(l.fmtDate('2026-08-30T23:59', 'weekdayShort'), 'dom, 30/08 às 23:59');
  assert.equal(l.fmtDate('2026-08-30T23:59', 'short'), '30/08');
  assert.equal(l.fmtDate('2026-11-08T23:59', 'long'), 'domingo, 8 nov. 2026, 23:59');
  assert.equal(l.relative('2026-11-07T10:00', '2026-11-08T12:00'), 'há 1 dia');
  assert.equal(l.relative('2026-11-04T10:00', '2026-11-08T12:00'), 'há 4 dias');
  assert.equal(l.relative('2026-11-08T23:59', '2026-11-08T12:00'), 'hoje');
  assert.equal(l.relative('2026-11-11T10:00', '2026-11-08T12:00'), 'em 3 dias');
});
