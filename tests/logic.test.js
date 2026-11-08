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

test('status', () => {
  const s = L().activityStatus;
  const now = '2026-11-08T12:00';
  assert.equal(s({ graded: false }, now), null);
  assert.equal(s({}, now), null);
  assert.equal(s({ graded: true, submitted: true, due: '2026-08-30T23:59' }, now), 'entregue');
  assert.equal(s({ graded: true, submitted: false, due: '2026-11-08T23:59' }, now), 'pendente');
  assert.equal(s({ graded: true, submitted: false }, now), 'pendente');
  assert.equal(s({ graded: true, submitted: false, due: '2026-11-01T23:59' }, now), 'atrasada');
  assert.equal(s({ graded: true, submitted: false, opens: '2026-11-20T00:00', due: '2026-11-30T23:59' }, now), 'nao-aberta');
});

test('filtro de cursos', () => {
  const { data, logic } = loadApp();
  const ctx = { favs: ['ihc', 'pi'], now: data.today };
  const base = { q: '', status: 'andamento', area: 'todas', fav: false, ordem: 'nome' };
  const ids = (f) => [...logic.filterCourses(data.courses, f, ctx).map((c) => c.id)];
  assert.equal(ids(base).length, 5);
  assert.deepEqual(ids({ ...base, q: '  interacao ' }), ['ihc']);
  assert.deepEqual(ids({ ...base, q: 'HUMANO' }), ['ihc']);
  assert.deepEqual(ids({ ...base, q: 'laura' }), ['bd']); // busca pelo docente
  assert.equal(ids({ ...base, status: 'todos' }).length, 7);
  assert.deepEqual(ids({ ...base, status: 'concluido' }).sort(), ['alg', 'calc']);
  assert.deepEqual(ids({ ...base, fav: true }).sort(), ['ihc', 'pi']);
  assert.deepEqual(ids({ ...base, area: 'Dados' }), ['bd']);
  assert.equal(ids({ ...base, q: 'zzz' }).length, 0);
  assert.equal(ids({ ...base, ordem: 'entrega' })[0], 'ihc'); // vence hoje
  assert.equal(ids(base)[0], 'bd'); // A–Z: Banco de Dados primeiro
  const prog = ids({ ...base, ordem: 'progresso' });
  const p = (id) => logic.courseSummary(data.courses.find((c) => c.id === id), data.today).progress;
  for (let i = 1; i < prog.length; i++) assert.ok(p(prog[i - 1]) >= p(prog[i]));
  assert.equal(ids({ ...base, ordem: 'recente' })[0], 'bd'); // lastAccess mais recente
  assert.equal(logic.activeFilterCount(base), 0);
  assert.equal(logic.activeFilterCount({ ...base, q: 'x', fav: true }), 2);
  assert.equal(logic.activeFilterCount({ ...base, q: '   ' }), 0);
});

test('calendário', () => {
  const l = L();
  const m = l.monthMatrix(2026, 7); // agosto/2026 começa no sábado
  assert.equal(m.length, 42);
  assert.equal(m[0], '2026-07-27');
  assert.equal(m[5], '2026-08-01');
  assert.equal(l.monthMatrix(2026, 10)[0], '2026-10-26');
  assert.equal(l.monthMatrix(2026, 10).length, 42);
  assert.equal(l.monthMatrix(2027, 1).length, 28); // fev/2027 começa na segunda e tem 28 dias
  assert.deepEqual(plain(l.addMonths(2026, 11, 1)), { year: 2027, month0: 0 });
  assert.deepEqual(plain(l.addMonths(2026, 0, -1)), { year: 2025, month0: 11 });
  assert.equal(l.monthLabel(2026, 10), 'novembro de 2026');
});

test('resumo, próximas e eventos', () => {
  const { data, logic } = loadApp();
  const ihc = data.courses.find((c) => c.id === 'ihc');
  const s = logic.courseSummary(ihc, data.today);
  assert.ok(s.nextDue.title.startsWith('Avaliação Cooperativa Planejamento'));
  assert.ok(s.submitted < s.graded);
  assert.ok(s.average >= 7 && s.average <= 10);
  assert.equal(s.progress, Math.round((s.submitted / s.graded) * 100));
  assert.equal(logic.currentSection(ihc, data.today).title, '26/10 a 08/11/2026');
  const alg = data.courses.find((c) => c.id === 'alg');
  const sa = logic.courseSummary(alg, data.today);
  assert.equal(sa.nextDue, null);
  assert.equal(sa.progress, 100);
  assert.equal(logic.currentSection(alg, data.today), null);

  const up7 = logic.upcoming(data.courses, data.today, { days: 7 });
  assert.ok(up7.length > 0);
  assert.equal(up7[0].item.title, 'Avaliação Cooperativa Planejamento');
  for (let i = 1; i < up7.length; i++) assert.ok(up7[i - 1].item.due <= up7[i].item.due);
  assert.ok(up7.every((u) => u.item.due <= '2026-11-15T23:59' && u.status !== 'entregue' && u.status !== 'atrasada'));
  const late = logic.upcoming(data.courses, data.today, { lateOnly: true });
  assert.equal(late.length, 1);
  assert.equal(late[0].course.id, 'bd');

  const ev = logic.courseEvents(ihc);
  assert.ok(ev.some((e) => e.date === '2026-11-08' && e.itemId));
  assert.ok(ev.some((e) => e.date === '2026-11-09' && !e.itemId));
  assert.equal(logic.allItems(ihc).length, ev.filter((e) => e.itemId).length + logic.allItems(ihc).filter((x) => !x.item.due).length);
});
