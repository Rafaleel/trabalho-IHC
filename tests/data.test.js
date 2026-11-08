'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, allItems, glob, read } = require('./helpers');

const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/;
const DAY = /^\d{4}-\d\d-\d\d$/;

test('schema de todos os cursos', () => {
  const { data } = loadApp();
  assert.ok(data.courses.length >= 1);
  const ids = new Set();
  const courseIds = new Set();
  for (const c of data.courses) {
    assert.ok(!courseIds.has(c.id), `curso duplicado ${c.id}`);
    courseIds.add(c.id);
    for (const k of ['id', 'name', 'shortName', 'area', 'term', 'status', 'color', 'teacher', 'room', 'schedule', 'office', 'workload', 'lastAccess', 'plan', 'notices', 'participants', 'events', 'sections'])
      assert.ok(c[k] !== undefined, `${c.id}.${k}`);
    assert.ok(['andamento', 'concluido'].includes(c.status));
    assert.match(c.color, /^#[0-9a-f]{6}$/i);
    assert.ok(c.notices.length >= 2, `${c.id} avisos`);
    assert.ok(c.participants.length >= 10, `${c.id} participantes`);
    assert.ok(c.participants.some((p) => p.role === 'Professor(a)'));
    assert.ok(c.participants.some((p) => p.name === data.user.name));
    for (const k of ['ementa', 'objetivos', 'conteudo', 'metodologia', 'avaliacao', 'bibliografia']) assert.ok(c.plan[k], `${c.id}.plan.${k}`);
    assert.equal(c.plan.avaliacao.reduce((s, a) => s + a.peso, 0), 100, `${c.id} pesos do plano`);
    for (const n of c.notices) assert.match(n.date, ISO);
    for (const e of c.events) assert.match(e.date, DAY);
    for (const s of c.sections) {
      if (s.start) assert.match(s.start, DAY);
      if (s.end) assert.match(s.end, DAY);
    }
    for (const it of allItems(c)) {
      assert.ok(!ids.has(it.id), `id duplicado ${it.id}`);
      ids.add(it.id);
      assert.ok(it.id.startsWith(c.id + '-'), `prefixo ${it.id}`);
      assert.ok(data.TYPE_META[it.type], `tipo ${it.type} em ${it.id}`);
      for (const f of ['opens', 'due']) if (it[f]) assert.match(it[f], ISO, `${it.id}.${f}`);
      if (it.submitted) assert.ok(it.graded, `${it.id} entregue sem ser avaliativo`);
      if (it.graded) assert.equal(typeof it.weight, 'number', `${it.id} peso`);
    }
    const w = allItems(c).filter((i) => i.graded).reduce((s, i) => s + i.weight, 0);
    assert.equal(Math.round(w), 100, `${c.id} soma dos pesos dos itens`);
  }
});

test('IHC fiel à referência', () => {
  const { data } = loadApp();
  const ihc = data.courses.find((c) => c.id === 'ihc');
  assert.ok(ihc);
  assert.equal(ihc.name, 'Interação Humano-Computador');
  assert.equal(ihc.sections.length, 14); // Geral + 13 semanas no Moodle real
  assert.equal(ihc.sections[0].title, 'Geral');
  assert.equal(ihc.sections[1].title, '17 a 23/08/2026');
  assert.equal(ihc.sections.at(-1).title, '07/12/2026');
  const items = allItems(ihc);
  const coop = items.find((i) => i.title.startsWith('Avaliação Cooperativa Planejamento'));
  assert.equal(coop.due, '2026-11-08T23:59');
  assert.equal(coop.opens, '2026-10-26T00:00');
  assert.equal(coop.submitted, false);
  const apres = items.find((i) => i.title.startsWith('Apresentação do grupo'));
  assert.equal(apres.due, '2026-11-16T20:30');
  const fund = items.find((i) => i.type === 'tarefa' && i.title.startsWith('Fundamentos e paradigmas'));
  assert.equal(fund.due, '2026-08-30T23:59');
  assert.equal(fund.submitted, true);
  assert.equal(ihc.room, 'Sala A1-302 (Laboratório 03)');
  assert.ok(!items.some((i) => /^\[/.test(i.title)), 'prefixos [X] removidos dos títulos');
  assert.ok(!items.some((i) => /\(prazo:/.test(i.title)), '"(prazo: …)" removido dos títulos');
});

test('sem dados reais de terceiros nem e-mails', () => {
  for (const f of glob('js/**/*.js')) {
    const src = read(f);
    for (const s of ['amandamelo', 'docs.google.com', 'Valdir', 'Jelinek', 'Boaventura', 'zenodo.22019530']) assert.ok(!src.includes(s), `${s} em ${f}`);
    assert.ok(!/[\w.-]+@[\w-]+\.[\w.]+/.test(src), `e-mail em ${f}`);
  }
});

test('cursos e situações', () => {
  const { data } = loadApp();
  const ids = (st) => [...data.courses.filter((c) => c.status === st).map((c) => c.id)].sort();
  assert.deepEqual(ids('andamento'), ['bd', 'ia', 'ihc', 'pi', 'web']);
  assert.deepEqual(ids('concluido'), ['alg', 'calc']);
  const today = data.today;
  const all = data.courses.flatMap((c) => allItems(c).map((i) => ({ c, i })));
  const late = all.filter(({ i }) => i.graded && !i.submitted && i.due && i.due < today);
  assert.equal(late.length, 1, 'exatamente 1 atrasada');
  assert.equal(late[0].c.id, 'bd');
  for (const c of data.courses.filter((c) => c.status === 'andamento')) {
    assert.ok(allItems(c).some((i) => i.graded && !i.submitted && i.due >= today && i.due <= '2026-11-22T23:59'), `${c.id} sem entrega próxima`);
    assert.ok(c.sections.length >= 9, `${c.id} poucas seções`);
    assert.ok(c.sections.filter((s) => (s.subsections || []).length).length >= 3, `${c.id} subseções EaD`);
    assert.ok(c.sections.some((s) => s.highlight && s.start <= '2026-11-08' && s.end >= '2026-11-08'), `${c.id} semana atual`);
    if (c.id !== 'ihc') assert.ok(!allItems(c).some((i) => i.due && i.due.startsWith('2026-11-08')), `${c.id} não pode vencer em 08/11`);
  }
  for (const c of data.courses.filter((c) => c.status === 'concluido')) {
    assert.equal(c.term, '2026/1');
    assert.ok(allItems(c).filter((i) => i.graded).every((i) => i.submitted && typeof i.grade === 'number'), c.id);
  }
});
