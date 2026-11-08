# Protótipo Moodle Unipampa (visão do aluno) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site estático navegável (SPA com hash routing) que redesenha o Moodle da Unipampa na visão do aluno: Página inicial, Painel, Meus cursos (filtro), Calendário e página de curso com 4 abas + Plano de ensino + Avisos, para 5 cursos ativos e 2 concluídos.

**Architecture:** HTML/CSS/JS puros, scripts clássicos (sem ES modules, para funcionar em `file://`) que penduram tudo em `window.App`. Dados em arquivos JS por curso; lógica pura em `js/logic.js`; views são funções puras `ctx → string HTML`; `js/app.js` faz roteamento, render e delegação de eventos. Testes em Node (`node --test`) carregam os mesmos scripts num `vm` com `window` falso; verificação visual com o MCP do Playwright.

**Tech Stack:** HTML5, CSS (custom properties), JavaScript ES2020 sem dependências; Node 24 `node:test` + `node:vm` para testes; Playwright MCP para checagem no navegador.

**Spec:** `docs/superpowers/specs/2026-11-08-moodle-prototipo-design.md`

## Global Constraints

- Nenhum emoji nem símbolo tipográfico usado como ícone na UI (bloqueados: `\p{Extended_Pictographic}`, U+2190–U+2BFF, `‹ ›`). Todo ícone é `<svg class="icon"><use href="#i-nome"/></svg>`.
- Todo `<button>` gerado tem a classe `btn` (+ variantes). Tamanhos: `btn--md` 40 px altura, padding `0 16px`; `btn--sm` 32 px, padding `0 12px`, com área de toque ≥ 40 px.
- Espaçamento só de `--s-1..--s-7` = 4, 8, 12, 16, 24, 32, 48 px. Raios só `--r-sm 8px`, `--r-md 12px`, `--r-full 999px`.
- Cor primária `#0b6b4b`. Cores semânticas só para situação. Cor do curso só em faixa do card, pontos do calendário e ícone do curso.
- "Hoje" fixo: `2026-11-08T12:00`. Usuário: Rafael da Silva Moral, iniciais "RM".
- Sem textos de bastidor ("Mockup exclusivo", "versão V4", banner de protótipo).
- Sem nomes reais além do aluno; **nenhum e-mail** em lugar nenhum (nem fictício); link do Google Docs removido; `referencia/` nunca versionado.
- Site funciona em `file://` e em GitHub Pages project page; nenhum `fetch`.
- `lang="pt-BR"`, `document.title` por rota, foco visível, contraste AA.
- Commits locais ao fim de cada task, mensagens em inglês no formato Conventional Commits (`feat:`, `test:`, `chore:`, `docs:`). Nada de push/GitHub até o usuário pedir no final.

## Review Focus

1. **Digitar na busca de Meus cursos** não pode perder foco/cursor a cada tecla (só a região de resultados re-renderiza). → Task 8, verificação no navegador.
2. **Rotas inválidas** (`#/curso/xyz`, `#/curso/ihc/foo`, `#/abc`, hash vazio) → Página não encontrada ou Página inicial, nunca tela em branco. → teste em Task 1 e Task 5.
3. **Busca sem acento/maiúsculas e com espaços** ("  interacao ", "HUMANO") encontra "Interação Humano-Computador". → teste em Task 4.
4. **Navegação de mês na virada de ano e meses de 6 semanas** (dez/2026 → jan/2027; ago/2026 começa no sábado) no calendário geral e no lateral. → teste em Task 4.
5. **Dropdowns do topo**: só um aberto por vez, fecham com Esc e clique fora, foco volta ao botão. → Task 5, verificação no navegador.

---

## File Structure

```
index.html                 casca: <div id="app">, sprite, scripts na ordem abaixo
404.html                   redireciona para <base>/index.html#<rota>
.gitignore                 referencia/  .superpowers/  node_modules/
README.md                  como abrir, como publicar no GitHub Pages
assets/logo-unipampa.png   copiado de referencia/…_files/logo_unipampa.png
css/styles.css             tokens + reset + componentes + layouts das telas
js/icons.js                App.icons.sprite (string <svg><symbol…>), App.icons.icon(name, cls?)
js/data/base.js            App.data: today, user, TYPE_META, siteNotices, notifications, messages, peoplePool
js/data/ihc.js             curso real de IHC (transcrito)
js/data/web.js, bd.js, ia.js, pi.js       cursos ativos fictícios
js/data/concluidos.js      2 cursos concluídos
js/logic.js                App.logic: funções puras (rota, datas, status, filtros, calendário)
js/ui.js                   App.ui: componentes HTML (btn, tag, sectionCard, itemRow, miniCalendar…) + toast()
js/views/shell.js          App.views.shell(ctx, inner) cabeçalho + dropdowns + toast container
js/views/home.js           App.views.home
js/views/painel.js         App.views.painel
js/views/cursos.js         App.views.cursos + App.views.cursosResults
js/views/calendario.js     App.views.calendario
js/views/curso.js          App.views.curso (aba Curso, sidebar, plano, avisos)
js/views/curso-abas.js     App.views.participantes / notas / atividades
js/views/notfound.js       App.views.notfound
js/app.js                  estado, router, render, delegação de eventos, localStorage
tests/helpers.js           loadApp(): carrega scripts em vm e devolve window.App
tests/logic.test.js, tests/data.test.js, tests/views.test.js, tests/static.test.js
```

Ordem dos `<script>` em `index.html` (e em `loadApp`): `icons, data/base, data/ihc, data/web, data/bd, data/ia, data/pi, data/concluidos, logic, ui, views/*, app`. `app.js` só inicia se `document` existir (`if (typeof document !== 'undefined' && document.getElementById('app'))`).

## Data schema (contrato usado por todas as tasks)

```js
App.data = {
  today: '2026-11-08T12:00',
  user: { name: 'Rafael da Silva Moral', initials: 'RM' },
  TYPE_META: { // tipo → { label, icon, tone }  tone ∈ file|task|forum|link|page|text
    pdf, pptx, arquivo, video, link, kahoot, forum, pagina, tarefa, questionario, texto },
  siteNotices: [{ id, title, body, date }],
  notifications: [{ id, text, time }], messages: [{ id, from, preview, time }],
  courses: [Course],          // cada data/*.js faz App.data.courses.push(...)
};
Course = {
  id, name, shortName, area, term: '2026/2'|'2026/1', status: 'andamento'|'concluido',
  color: '#hex', teacher: { name }, room, schedule, office, workload, lastAccess: ISO,
  favoriteByDefault: bool,
  plan: { ementa, objetivos: [str], conteudo: [str], metodologia, avaliacao: [{ item, peso }], bibliografia: [str] },
  notices: [{ id, title, body, author, date: ISO }],
  participants: [{ name, role: 'Professor(a)'|'Estudante', lastAccess: ISO }],
  events: [{ date: 'YYYY-MM-DD', time?: 'HH:mm', title }],      // eventos sem item (ex.: avaliação escrita)
  sections: [Section],
};
Section = { id, title, summary?, highlight?: bool, start?: 'YYYY-MM-DD', end?: 'YYYY-MM-DD',
            items: [Item], subsections?: [{ id, title, items: [Item] }] };
Item = { id, type: keyof TYPE_META, title, ref?: str, text?: [str], instructions?: [str],
         graded?: bool, opens?: 'YYYY-MM-DDTHH:mm', due?: 'YYYY-MM-DDTHH:mm',
         submitted?: bool, grade?: number|null, weight?: number, feedback?: str };
```

Ids: `Item.id` único globalmente no formato `<courseId>-<n>`; `Section.id` = `<courseId>-s<n>`.

---

### Task 1: Base do projeto, harness de testes e lógica de rotas/datas

**Files:**
- Create: `.gitignore`, `tests/helpers.js`, `js/logic.js`, `tests/logic.test.js`
- Move: `Curso_ CC INTERACAO HUMANO-COMPUTADOR _ Moodle.html` e `…_files/` → `referencia/`

**Interfaces:**
- Produces: `loadApp(files?: string[]) → App` (tests/helpers.js; padrão = lista completa de scripts que existirem). `App.logic.norm(s) → string` (sem acento, minúsculo, trim, espaços colapsados). `App.logic.parseRoute(hash) → { name, params: { id?, tab? }, query: {} }` com `name ∈ home|painel|cursos|calendario|curso|notfound`, `tab ∈ curso|participantes|notas|atividades|plano|avisos`. `App.logic.buildHash(name, params?, query?) → string`. `App.logic.parseDate(iso) → Date` (local), `toKey(Date) → 'YYYY-MM-DD'`, `fmtDate(iso, style)` com `style ∈ 'short'(08/11) | 'long'(domingo, 8 nov. 2026, 23:59) | 'weekdayShort'(dom, 08/11 às 23:59)`, `relative(iso, nowIso) → 'há 1 dia' | 'hoje' | 'em 3 dias'`.

- [ ] **Step 1: Mover referências e criar `.gitignore`** com `referencia/`, `.superpowers/`, `node_modules/`. Os arquivos de referência têm dados pessoais e não podem ser publicados.

- [ ] **Step 2: Escrever `tests/helpers.js`**: lê os scripts com `fs`, executa em ordem num `vm.createContext({ window: {}, console })` onde `window.window = window` e `globalThis` aponta para `window`; retorna `ctx.window.App`.

- [ ] **Step 3: Escrever testes falhando em `tests/logic.test.js`**

```js
test('parseRoute', () => {
  const { parseRoute } = loadApp(['js/logic.js']).logic;
  assert.deepEqual(parseRoute('').name, 'home');
  assert.deepEqual(parseRoute('#/').name, 'home');
  assert.deepEqual(parseRoute('#/curso/ihc'), { name: 'curso', params: { id: 'ihc', tab: 'curso' }, query: {} });
  assert.deepEqual(parseRoute('#/curso/ihc/notas').params.tab, 'notas');
  assert.equal(parseRoute('#/curso/ihc/foo').name, 'notfound');
  assert.equal(parseRoute('#/abc').name, 'notfound');
  assert.deepEqual(parseRoute('#/cursos?q=web&fav=1').query, { q: 'web', fav: '1' });
});
test('buildHash round-trip', () => {
  const { parseRoute, buildHash } = loadApp(['js/logic.js']).logic;
  const h = buildHash('cursos', {}, { q: 'banco de dados', status: 'todos' });
  assert.deepEqual(parseRoute(h).query, { q: 'banco de dados', status: 'todos' });
  assert.equal(buildHash('curso', { id: 'ihc', tab: 'curso' }), '#/curso/ihc');
});
test('datas', () => {
  const L = loadApp(['js/logic.js']).logic;
  assert.equal(L.norm('  Interação   HUMANO '), 'interacao humano');
  assert.equal(L.fmtDate('2026-08-30T23:59', 'weekdayShort'), 'dom, 30/08 às 23:59');
  assert.equal(L.relative('2026-11-07T10:00', '2026-11-08T12:00'), 'há 1 dia');
  assert.equal(L.relative('2026-11-08T23:59', '2026-11-08T12:00'), 'hoje');
});
```
Nota: `parseRoute` validar se o curso existe é responsabilidade do app (Task 5), não da lógica.

- [ ] **Step 4: Rodar** `node --test tests/` → FAIL (`App.logic` indefinido).

- [ ] **Step 5: Implementar `js/logic.js`** (IIFE: `window.App = window.App || {}; App.logic = {...}`). Datas sempre como hora local; não usar `toLocaleDateString` (resultado varia por ambiente) — formatar com tabelas próprias de nomes de dias/meses pt-BR.

- [ ] **Step 6: Rodar** `node --test tests/` → PASS.
- [ ] **Step 7: Commit** `chore: scaffold project, test harness and route/date logic`

---

### Task 2: Dados base e curso real de IHC

**Files:**
- Create: `js/data/base.js`, `js/data/ihc.js`, `tests/data.test.js`

**Interfaces:**
- Consumes: schema acima.
- Produces: `App.data` com `today`, `user`, `TYPE_META`, `siteNotices` (3), `notifications` (4), `messages` (3), `peoplePool` (30 nomes fictícios), `courses[0]` = IHC.

- [ ] **Step 1: Escrever `tests/data.test.js`** (vale para todos os cursos, inclusive os das Tasks 3):

```js
test('schema de todos os cursos', () => {
  const { data } = loadApp();
  const ids = new Set();
  for (const c of data.courses) {
    for (const k of ['id','name','area','term','status','color','teacher','room','schedule','plan','notices','participants','sections'])
      assert.ok(c[k] !== undefined, `${c.id}.${k}`);
    assert.ok(c.notices.length >= 2 && c.participants.length >= 10);
    for (const it of allItems(c)) {
      assert.ok(!ids.has(it.id), `id duplicado ${it.id}`); ids.add(it.id);
      assert.ok(data.TYPE_META[it.type], `tipo ${it.type}`);
      for (const f of ['opens','due']) if (it[f]) assert.match(it[f], /^\d{4}-\d\d-\d\dT\d\d:\d\d$/);
      if (it.submitted) assert.ok(it.graded);
    }
  }
});
test('IHC fiel à referência', () => {
  const ihc = loadApp().data.courses.find(c => c.id === 'ihc');
  assert.equal(ihc.sections.length, 16);
  assert.equal(ihc.sections[0].title, 'Geral');
  assert.equal(ihc.sections.at(-1).title, '07/12/2026');
  const coop = allItems(ihc).find(i => i.title.startsWith('Avaliação Cooperativa Planejamento'));
  assert.equal(coop.due, '2026-11-08T23:59'); assert.equal(coop.submitted, false);
  const apres = allItems(ihc).find(i => i.title.startsWith('Apresentação do grupo'));
  assert.equal(apres.due, '2026-11-16T20:30');
  assert.equal(ihc.room, 'Sala A1-302 (Laboratório 03)');
});
test('sem dados reais de terceiros', () => {
  const src = fs.readFileSync('js/data/ihc.js', 'utf8');
  for (const s of ['amandamelo', 'docs.google.com', 'Valdir']) assert.ok(!src.includes(s), s);
  for (const f of glob('js/**/*.js')) assert.ok(!/[\w.-]+@[\w-]+\.[\w.]+/.test(read(f)), `e-mail em ${f}`);
});
```
`allItems(c)` = itens das seções + subseções (helper local do teste).

- [ ] **Step 2: Rodar** → FAIL.

- [ ] **Step 3: Escrever `js/data/base.js`** com `TYPE_META` exatamente:

| tipo | label | icon | tone |
|---|---|---|---|
| pdf | PDF | file-text | file |
| pptx | PPTX | presentation | file |
| arquivo | Arquivo | file | file |
| video | Vídeo | play | link |
| link | Link | link | link |
| kahoot | Kahoot | gamepad | link |
| forum | Fórum | messages | forum |
| pagina | Página | file-lines | page |
| tarefa | Tarefa | upload | task |
| questionario | Questionário | list-checks | task |
| texto | — | — | text |

- [ ] **Step 4: Transcrever IHC para `js/data/ihc.js`**. Extrair o texto com um script descartável no scratchpad (não versionar), `python3 -I script.py "referencia/Curso_ CC INTERACAO HUMANO-COMPUTADOR _ Moodle.html"`, usando `html.parser.HTMLParser`: recortar de `class="course-content"` até `block-region-side-pre`, ignorar `script/style`, quebrar linha em `li/p/div/h3/h4/br`, prefixar `## ` em elementos com classe `sectionname` e `- ` em `instancename`. Regras:
  - 16 seções na ordem; cada "EaD (…)" vira `subsection` da semana anterior.
  - Prefixo `[PDF]/[PPTX]/[VÍDEO]/[VÍDEOS]/[KAHOOT]/[TRANSCRIÇÃO]/[MODELO]/[ATIVIDADE]` sai do título e define `type`: PDF→pdf, PPTX→pptx, VÍDEO(S)→video, KAHOOT→kahoot, TRANSCRIÇÃO→arquivo, MODELO→link; `[ATIVIDADE]` usa o tipo do Moodle (Fórum→forum, Tarefa→tarefa, URL "Questionário"→questionario, Página→pagina) com `graded: true`. "(prazo: dd/mm/aaaa)" sai do título (vira `due`). Itens sem prefixo: Arquivo→arquivo, URL→link, Fórum→forum, Página→pagina; rótulos de texto → `type:'texto'` com `text`.
  - `opens`/`due` exatamente como "Aberto/Vencimento"; tarefas com só "(prazo: X)" → `due: X T23:59`.
  - Situação em 08/11: prazo passado ou fórum avaliativo sem data → `submitted: true`, nota 7.0–10.0, feedback curto. Prazo ≥ 08/11 → `submitted: false`, `grade: null`.
  - Pesos (`weight`) fictícios somando 100 entre itens avaliativos; `plan.avaliacao` coerente (ex.: Atividades EaD 30, Avaliação escrita 25, Trabalho prático 30, Seminário 15).
  - `events`: `2026-11-09` "Avaliação escrita" 20:30 (Sala A1-301); `2026-11-16` "Apresentações do trabalho prático" 20:30; `2026-12-07` "Seminário — Tópicos Especiais em IHC" 20:30.
  - Docente fictícia: "Profa. Ana Ribeiro" (sem e-mail; "Compartilhe seu portfólio com a professora"); "Do rabisco à tela em minutos, por Valdir…" → "…, por Lucas Andrade"; remover a URL do Google Docs.
  - `office`: "Segundas, 16:00–18:00, sala A1-229 (agendar pelo Google Chat)"; `schedule`: "Segundas, 20:30–22:20"; `workload`: "60 h (2 créditos presenciais + 2 a distância)".
  - 4 avisos fictícios entre 20/10 e 07/11 (um: "Avaliação escrita na segunda, 09/11, sala A1-301"), ~22 participantes do `peoplePool` + docente; `lastAccess` = `2026-11-07T21:40`.

- [ ] **Step 5: Rodar** `node --test tests/` → PASS.

---

### Task 3: Cursos fictícios (4 ativos + 2 concluídos)

**Files:**
- Create: `js/data/web.js`, `js/data/bd.js`, `js/data/ia.js`, `js/data/pi.js`, `js/data/concluidos.js`
- Modify: `tests/data.test.js` (acrescentar testes abaixo)

**Interfaces:**
- Consumes: schema, `peoplePool`.
- Produces: cursos com ids `web`, `bd`, `ia`, `pi` (andamento, 2026/2) e `alg`, `calc` (concluido, 2026/1).

| id | nome | área | cor | horário | sala |
|---|---|---|---|---|---|
| web | Desenvolvimento Web Responsivo | Programação | #2f6fed | Quartas, 20:30–22:20 | Lab B2-105 |
| bd | Banco de Dados | Dados | #6b4fc7 | Terças, 18:40–20:20 | Sala C1-207 |
| ia | Inteligência Artificial | IA e Dados | #d4692c | Quintas, 19:00–20:40 | Lab C3-110 |
| pi | Projeto Integrador | Projeto | #b4407e | Sextas, 20:30–22:20 | Sala A2-114 |
| alg | Algoritmos e Programação | Programação | #3d8a8a | Segundas, 18:40–20:20 | Lab A1-301 |
| calc | Cálculo I | Matemática | #8a6d3b | Terças/Quintas, 18:40–20:20 | Sala B1-110 |

IHC: área "Design e UX", cor `#0b6b4b`.

- [ ] **Step 1: Acrescentar testes falhando**

```js
test('cursos e situações', () => {
  const { data, logic } = loadApp();
  assert.deepEqual(data.courses.filter(c => c.status === 'andamento').map(c => c.id).sort(), ['bd','ia','ihc','pi','web']);
  assert.deepEqual(data.courses.filter(c => c.status === 'concluido').map(c => c.id).sort(), ['alg','calc']);
  const today = data.today;
  const all = data.courses.flatMap(c => allItems(c).map(i => ({ c, i })));
  const late = all.filter(({ i }) => i.graded && !i.submitted && i.due && i.due < today);
  assert.equal(late.length, 1);                                  // exatamente 1 atrasada no total
  for (const c of data.courses.filter(c => c.status === 'andamento'))
    assert.ok(allItems(c).some(i => i.graded && !i.submitted && i.due >= today && i.due <= '2026-11-22T23:59'), c.id);
  for (const c of data.courses.filter(c => c.status === 'concluido'))
    assert.ok(allItems(c).filter(i => i.graded).every(i => i.submitted && typeof i.grade === 'number'));
});
```

- [ ] **Step 2: Rodar** → FAIL.

- [ ] **Step 3: Escrever os 6 arquivos.** Ativos: semanas de 17/08 a 07/12/2026 (mesmos intervalos de IHC), 8–12 seções com 2–5 itens, mix de tipos, subseções "EaD" em ao menos 3 semanas, `highlight: true` na semana 02 a 08/11 ou 09 a 15/11 (a que contém 08/11). A única atrasada fica em `bd`. Nenhum curso fictício tem `due` em 2026-11-08 (IHC precisa ser o primeiro em "Próxima entrega"). `fav` padrão: `ihc` e `pi`. Concluídos: Geral + 5–6 seções entre 09/03 e 10/07/2026, todas entregues, 2 avisos antigos, plano completo.

- [ ] **Step 4: Rodar** `node --test tests/` → PASS.

---

### Task 4: Lógica derivada (situação, resumo, filtros, calendário)

**Files:**
- Modify: `js/logic.js`, `tests/logic.test.js`

**Interfaces:**
- Produces:
  - `allItems(course) → [{ item, section, subsection|null }]`
  - `activityStatus(item, nowIso) → null | 'entregue' | 'pendente' | 'atrasada' | 'nao-aberta'` (null se `!graded`; `nao-aberta` se `opens > now`)
  - `courseSummary(course, nowIso) → { graded, submitted, progress /*0–100 inteiro*/, nextDue: item|null /*avaliativo não entregue com menor due >= now*/, average: number|null /*média ponderada das notas lançadas, 1 casa*/ }`
  - `upcoming(courses, nowIso, { days?: number, lateOnly?: bool }) → [{ course, item, status }]` ordenado por `due`
  - `filterCourses(courses, f, ctx) → Course[]` com `f = { q, status: 'andamento'|'concluido'|'todos', area: 'todas'|string, fav: bool, ordem: 'nome'|'entrega'|'progresso'|'recente' }`, `ctx = { favs: string[], now }`
  - `activeFilterCount(f) → number` (conta q≠'', status≠'andamento', area≠'todas', fav)
  - `monthMatrix(year, month0) → string[]` (chaves `YYYY-MM-DD`, segunda-feira primeiro, 35 ou 42 células)
  - `addMonths(year, month0, delta) → { year, month0 }`
  - `courseEvents(course) → [{ date, time, title, courseId, itemId? }]` (itens com `due` + `course.events`)
  - `currentSection(course, nowIso) → Section|null` (a que contém hoje por `start/end`)

- [ ] **Step 1: Testes falhando**

```js
test('status', () => {
  const { activityStatus: s } = L;
  const now = '2026-11-08T12:00';
  assert.equal(s({ graded: false }, now), null);
  assert.equal(s({ graded: true, submitted: true, due: '2026-08-30T23:59' }, now), 'entregue');
  assert.equal(s({ graded: true, submitted: false, due: '2026-11-08T23:59' }, now), 'pendente');
  assert.equal(s({ graded: true, submitted: false, due: '2026-11-01T23:59' }, now), 'atrasada');
  assert.equal(s({ graded: true, submitted: false, opens: '2026-11-20T00:00', due: '2026-11-30T23:59' }, now), 'nao-aberta');
});
test('filtro', () => {
  const { data, logic } = loadApp(); const ctx = { favs: ['ihc','pi'], now: data.today };
  const base = { q: '', status: 'andamento', area: 'todas', fav: false, ordem: 'nome' };
  assert.equal(logic.filterCourses(data.courses, base, ctx).length, 5);
  assert.deepEqual(logic.filterCourses(data.courses, { ...base, q: '  interacao ' }, ctx).map(c => c.id), ['ihc']);
  assert.deepEqual(logic.filterCourses(data.courses, { ...base, q: 'HUMANO' }, ctx).map(c => c.id), ['ihc']);
  assert.equal(logic.filterCourses(data.courses, { ...base, status: 'todos' }, ctx).length, 7);
  assert.deepEqual(logic.filterCourses(data.courses, { ...base, fav: true }, ctx).map(c => c.id).sort(), ['ihc','pi']);
  assert.equal(logic.filterCourses(data.courses, { ...base, q: 'zzz' }, ctx).length, 0);
  assert.equal(logic.filterCourses(data.courses, { ...base, ordem: 'entrega' }, ctx)[0].id, 'ihc'); // vence hoje
  assert.equal(logic.activeFilterCount({ ...base, q: 'x', fav: true }), 2);
});
test('calendário', () => {
  const m = L.monthMatrix(2026, 7); // agosto/2026 começa no sábado
  assert.equal(m.length, 42); assert.equal(m[0], '2026-07-27'); assert.equal(m[5], '2026-08-01');
  assert.equal(L.monthMatrix(2026, 10)[0], '2026-10-26');
  assert.deepEqual(L.addMonths(2026, 11, 1), { year: 2027, month0: 0 });
  assert.deepEqual(L.addMonths(2026, 0, -1), { year: 2025, month0: 11 });
});
test('resumo IHC', () => {
  const { data, logic } = loadApp(); const ihc = data.courses.find(c => c.id === 'ihc');
  const s = logic.courseSummary(ihc, data.today);
  assert.ok(s.nextDue.title.startsWith('Avaliação Cooperativa Planejamento'));
  assert.ok(s.submitted < s.graded && s.average >= 7);
  assert.equal(logic.currentSection(ihc, data.today).title, '26/10 a 08/11/2026');
});
```

- [ ] **Step 2: Rodar** → FAIL. **Step 3: Implementar.** **Step 4: Rodar** → PASS.

---

### Task 5: Casca do app — design system, ícones, cabeçalho, roteador, 404

**Files:**
- Create: `index.html`, `404.html`, `assets/logo-unipampa.png`, `css/styles.css`, `js/icons.js`, `js/ui.js`, `js/views/shell.js`, `js/views/notfound.js`, `js/app.js`, `tests/static.test.js`, `tests/views.test.js`

**Interfaces:**
- Consumes: `App.logic.parseRoute/buildHash`, `App.data`.
- Produces:
  - `App.icons.icon(name, cls = '') → '<svg class="icon {cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'`; ícones mínimos: `search bell messages chevron-down chevron-right chevron-left x star star-filled calendar info user map-pin clock book file file-text presentation play link gamepad upload list-checks file-lines grid list filter check alert arrow-right external menu log-out home layout`.
  - `App.ui`: `btn({ label, icon?, variant='secondary'|'primary'|'ghost', size='md'|'sm', href?, attrs? })` (gera `<a class="btn …">` se `href`, senão `<button type="button" class="btn …">`), `tag(text, tone)` com `tone ∈ neutral|success|warning|danger|info`, `statusTag(status)` (entregue→success "Entregue", pendente→warning "Pendente", atrasada→danger "Atrasada", nao-aberta→neutral "Não aberta"), `esc(s)`, `toast(msg)` (DOM; no-op sem `document`).
  - `App.views.shell(ctx, innerHtml, activeNav)`; `App.views.notfound(ctx)`.
  - `ctx = { App, route, state, now }`; `state = { favs: string[], openSections: Record<sectionId, bool>, sideMonth: Record<courseId,{year,month0}>, calMonth, calDay, calCourses: string[], painelRange: 7|30|'atrasadas', view: 'cards'|'lista', openMenu: null|'notif'|'msg'|'user' }`.
  - Convenções de evento delegadas em `#app`: `[data-action="…"]` + `data-*`; `[data-soon]` → `toast('Disponível apenas na versão completa do Moodle.')`.

- [ ] **Step 1: Testes estáticos falhando (`tests/static.test.js`)**

```js
const SRC = ['index.html', '404.html', 'css/styles.css', ...glob('js/**/*.js')];
test('sem emoji/símbolos-ícone', () => {
  const bad = /[\p{Extended_Pictographic}\u2190-\u2BFF\u2039\u203A]/u;
  for (const f of SRC) assert.ok(!bad.test(read(f)), f);
});
test('todo <button> tem .btn', () => {
  for (const f of glob('js/**/*.js')) for (const m of read(f).matchAll(/<button\b[^>]*>/g))
    assert.match(m[0], /class="[^"]*\bbtn\b/, `${f}: ${m[0]}`);
});
test('espaçamento e raio só por tokens', () => {
  const css = read('css/styles.css').replace(/:root\s*{[^}]*}/, '');
  for (const m of css.matchAll(/(?:padding|margin|gap|row-gap|column-gap)[^:;{]*:\s*([^;]+);/g))
    for (const px of m[1].matchAll(/(\d+)px/g)) assert.ok(['0'].includes(px[1]), `use var(--s-*): ${m[0]}`);
  for (const m of css.matchAll(/border-radius:\s*([^;]+);/g)) assert.match(m[1], /^(var\(--r-(sm|md|full)\)|50%|0)$/);
});
test('index carrega scripts existentes', () => {
  for (const m of read('index.html').matchAll(/src="([^"]+)"/g)) assert.ok(fs.existsSync(m[1]), m[1]);
});
```
`tests/views.test.js` (iniciar):
```js
test('notfound e shell', () => {
  const App = loadApp(); const ctx = mkCtx(App, '#/abc');
  const html = App.views.shell(ctx, App.views.notfound(ctx), null);
  assert.match(html, /Página não encontrada/); assert.match(html, /href="#\/cursos"/);
  assert.ok(!/aria-current="page"/.test(html));
  const home = App.views.shell(mkCtx(App, '#/'), '', 'home');
  assert.match(home, /aria-current="page"[^>]*>[^<]*Página inicial|Página inicial[^<]*<\/a>/);
});
```
`mkCtx(App, hash)` = helper em `tests/helpers.js` com estado padrão.

- [ ] **Step 2: Rodar** → FAIL.

- [ ] **Step 3: `css/styles.css`** — `:root` com tokens: `--s-1..--s-7`, `--r-sm/md/full`, cores (`--c-primary #0b6b4b`, `--c-primary-hover #08553b`, `--c-primary-soft #e8f5ee`, `--c-bg #f5f7f6`, `--c-surface #fff`, `--c-border #dde5e2`, `--c-text #1d2d35`, `--c-muted #5b6b73`, `--c-success #0a7a4b`/soft, `--c-warning #9a6200`/soft `#fff3dc`, `--c-danger #b42339`/soft, `--c-info #2f63c4`/soft), tons de tipo de item (file azul, task rosa `#c23a5a`, forum roxo `#6c46c7`, link verde-azulado `#0f7c78`, page cinza), fonte (`--f-12…--f-28`), sombra única. Componentes: `.btn` (+`--primary --secondary --ghost --sm --md --icon`), `.tag--*`, `.card`, `.icon` (1em; tamanhos 16/20), foco `:focus-visible` 3px. Layout: `.topbar`, `.container` (max 1200), `.page-head`, breakpoints 980 e 680. `prefers-reduced-motion`.

- [ ] **Step 4: `js/icons.js`** — sprite com `<symbol id="i-…" viewBox="0 0 24 24">` (paths Lucide, ISC; stroke via CSS `fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round`). `index.html` injeta o sprite no início do `body` via `app.js`.

- [ ] **Step 5: `index.html`, `404.html`, `js/ui.js`, `js/views/shell.js`, `js/views/notfound.js`, `js/app.js`.**
  - Cabeçalho: logo (`assets/logo-unipampa.png`, alt "Unipampa") → `#/`; nav: Página inicial, Painel, Meus cursos, Calendário (`aria-current="page"` no ativo; "Meus cursos" ativo também nas rotas de curso); direita: busca (`data-soon`), notificações (badge = `notifications.length`), mensagens, avatar "RM" + chevron. Dropdowns: `aria-expanded`, um aberto por vez (`state.openMenu`), Esc e clique fora fecham e devolvem foco ao botão. Menu do avatar: Perfil (soon), Notas (soon), Calendário (link), Preferências (soon), Sair (soon). Em < 680 px a nav vira botão "menu" que abre a lista.
  - `app.js`: `render()` em `hashchange`; rota `curso` com id inexistente → notfound; `document.title = '<tela> | Moodle Unipampa'`; rolar ao topo ao trocar de rota (não ao trocar só a query de Meus cursos); favoritos em `localStorage['moodle-proto:favs']` com `try/catch`, padrão = cursos com `favoriteByDefault`.
  - `404.html`: script calcula a base (`location.pathname` até o 1º segmento para project page; se `.github.io` não estiver no host, usa `/`) e faz `location.replace(base + '#' + resto-do-caminho)`.
  - Rotas ainda não implementadas (Tasks 6–9) renderizam um placeholder simples temporário.

- [ ] **Step 6: Rodar** `node --test tests/` → PASS.

- [ ] **Step 7: Verificar no navegador** (Playwright MCP, `file:///…/index.html#/abc`): página não encontrada aparece; abrir notificações e depois mensagens → só um aberto; Esc fecha; console sem erros; em 360 px sem rolagem horizontal.

---

### Task 6: Página do curso — aba Curso, barra lateral, Plano de ensino, Avisos

**Files:**
- Create: `js/views/curso.js`
- Modify: `js/ui.js` (componentes abaixo), `css/styles.css`, `js/app.js`, `tests/views.test.js`

**Interfaces:**
- Consumes: `courseSummary`, `activityStatus`, `currentSection`, `courseEvents`, `monthMatrix`, `addMonths`, `fmtDate`, `relative`, `App.ui.*`.
- Produces: `App.ui.courseHeader(course, tab)` (breadcrumb + título + abas como `<a role="tab">`… usar `<nav>` com links e `aria-current`), `App.ui.itemRow(item, status)`, `App.ui.sectionCard(section, open, now)`, `App.ui.miniCalendar({ year, month0, events, selectedDay, today, navAction })`, `App.ui.courseSidebar(course, ctx)`; `App.views.curso(ctx)` (tabs `curso|plano|avisos`). Ações: `toggle-section` (data-id), `expand-all`/`collapse-all`, `side-month` (data-dir ±1), `side-day` (data-day), `toggle-instructions` (data-id).

- [ ] **Step 1: Testes falhando**

```js
test('aba Curso IHC', () => {
  const App = loadApp(); const html = App.views.curso(mkCtx(App, '#/curso/ihc'));
  assert.match(html, /Interação Humano-Computador/);
  assert.equal((html.match(/data-section-id=/g) || []).length, 16);
  assert.match(html, /Esta semana/);
  assert.match(html, /href="#\/curso\/ihc\/plano"/);
  assert.match(html, /href="#\/curso\/ihc\/avisos"/);
  assert.ok(html.indexOf('Calendário do curso') < html.indexOf('Avisos do professor'));
  assert.ok(html.indexOf('Avisos do professor') < html.indexOf('Informações do curso'));
  assert.ok(!/\[(PDF|ATIVIDADE|KAHOOT)\]/.test(html));
  assert.match(html, /Pendente/); assert.match(html, /Entregue/);
});
test('curso concluído', () => {
  const App = loadApp(); const html = App.views.curso(mkCtx(App, '#/curso/alg'));
  assert.match(html, /Concluído/); assert.match(html, /julho de 2026/i);
});
test('plano e avisos', () => {
  const App = loadApp();
  assert.match(App.views.curso(mkCtx(App, '#/curso/ihc/plano')), /Ementa/);
  assert.equal((App.views.curso(mkCtx(App, '#/curso/ihc/avisos')).match(/class="notice"/g) || []).length, 4);
});
```

- [ ] **Step 2: Rodar** → FAIL.

- [ ] **Step 3: Implementar** seguindo a §6.5 da spec e o mockup B (`.superpowers/brainstorm/35838-1794164381/content/pagina-curso.html`):
  - Faixa de resumo (andamento): "X de Y atividades entregues" · "Próxima entrega dd/mm" · "Média parcial N,N". Concluído: "Concluído" · "Média final N,N" · "Y de Y entregues".
  - Seções: cabeçalho `<button class="btn btn--ghost section__toggle" aria-expanded data-action="toggle-section">` com chevron; aberta por padrão = Geral + `currentSection` (concluído: Geral). Título da seção "Esta semana" como `tag info`. "Expandir tudo / Contrair tudo" no topo.
  - Linha do item: ícone no quadrado com o tom do tipo; título (link `data-soon`); linha secundária = `ref` ou "Prazo: {weekdayShort}" (+ "Aberto: …" se `opens`); à direita `statusTag` se avaliativo, senão `tag(label, 'neutral')`. `texto` → parágrafos. `instructions` → `<details>`/botão "Ver instruções".
  - Sidebar: miniCalendar do mês de hoje (concluído: mês da última `due`), ‹ › com `btn--sm btn--icon` e `aria-label`, dia com evento tem ponto na cor do curso, clique no dia mostra a lista daquele dia abaixo; "Próximas entregas" (3). Avisos: 3 mais recentes (título, autor, `relative`) + "Ver todos os avisos". Informações: docente, sala, horário, atendimento, carga horária + `btn primary` "Plano de ensino".
  - Plano: ementa, objetivos, conteúdo, metodologia, tabela de avaliação (item/peso), bibliografia; link "Voltar ao curso".
  - < 980 px: sidebar abaixo.

- [ ] **Step 4: Rodar** → PASS.

- [ ] **Step 5: Navegador**: `#/curso/ihc` em 1280 e 360 px — seções abrem/fecham pelo teclado (Enter/Espaço), calendário lateral navega e marca 08, 09, 16 de novembro; F5 mantém a rota.

---

### Task 7: Abas Participantes, Notas, Atividades

**Files:**
- Create: `js/views/curso-abas.js`
- Modify: `js/views/curso.js` (despacha as abas), `css/styles.css`, `js/app.js`, `tests/views.test.js`

**Interfaces:**
- Consumes: `courseHeader`, `activityStatus`, `allItems`, `courseSummary`. As 3 abas usam largura total, sem barra lateral.
- Produces: `App.views.participantes(ctx)`, `App.views.notas(ctx)`, `App.views.atividades(ctx)`. Query de filtro nas abas: `?q=&papel=` (participantes), `?tipo=&situacao=` (atividades).

- [ ] **Step 1: Testes falhando**

```js
test('abas', () => {
  const App = loadApp();
  const p = App.views.participantes(mkCtx(App, '#/curso/ihc/participantes'));
  assert.match(p, /Profa\. Ana Ribeiro/); assert.match(p, /Rafael da Silva Moral/);
  assert.equal(App.views.participantes(mkCtx(App, '#/curso/ihc/participantes?papel=Professor(a)')).match(/<tr class="person"/g).length, 1);
  const n = App.views.notas(mkCtx(App, '#/curso/ihc/notas'));
  assert.match(n, /Média parcial/); assert.match(n, /—/);
  const a = App.views.atividades(mkCtx(App, '#/curso/bd/atividades'));
  assert.ok(a.indexOf('Atrasadas') < a.indexOf('Próximas') && a.indexOf('Próximas') < a.indexOf('Concluídas'));
  assert.match(App.views.atividades(mkCtx(App, '#/curso/ihc/atividades?situacao=zzz')), /Nenhuma atividade/);
});
```

- [ ] **Step 2: Rodar** → FAIL. **Step 3: Implementar** (§6.6–6.8 da spec; tabelas viram cards empilhados < 680 px; filtros atualizam a query com `history.replaceState` e re-renderizam só a lista). **Step 4: Rodar** → PASS.
- [ ] **Step 5: Navegador**: trocar abas pelo teclado; filtros em 360 px.

---

### Task 8: Meus cursos com filtro

**Files:**
- Create: `js/views/cursos.js`
- Modify: `js/ui.js` (`courseCard(course, ctx)`), `css/styles.css`, `js/app.js`, `tests/views.test.js`

**Interfaces:**
- Consumes: `filterCourses`, `activeFilterCount`, `courseSummary`, `parseRoute().query`.
- Produces: `App.views.cursos(ctx)` (página completa) e `App.views.cursosResults(ctx)` (status line + grade/lista, dentro de `<div id="course-results" aria-live="polite">`). Ações: `set-filter` (data-key, data-value), `toggle-fav` (data-id), `clear-filters`, `set-view`. Input de busca: evento `input` → atualiza query com `history.replaceState` e substitui **só** `#course-results`.

- [ ] **Step 1: Testes falhando**

```js
test('meus cursos', () => {
  const App = loadApp();
  const html = App.views.cursos(mkCtx(App, '#/cursos'));
  assert.equal((html.match(/class="course-card/g) || []).length, 5);
  assert.match(html, /aria-pressed="true"/);              // favorito
  const r = App.views.cursosResults(mkCtx(App, '#/cursos?q=zzz&fav=1'));
  assert.match(r, /Nenhum curso encontrado/); assert.match(r, /2 filtros ativos/); assert.match(r, /data-action="clear-filters"/);
  assert.match(App.views.cursosResults(mkCtx(App, '#/cursos?status=concluido')), /Algoritmos e Programação/);
});
```

- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** (§6.3): busca com ícone e botão "×" (`btn--sm btn--icon`, aria-label "Limpar busca", só visível com texto); segmentado Em andamento/Concluídos/Todos (`role="radiogroup"` ou botões com `aria-pressed`); botão "Só favoritos" com estrela e contador; chips de área (single, "Todas" + áreas existentes); select Ordenar; toggle Cartões/Lista; linha "N cursos · K filtros ativos · Limpar filtros". Card: faixa com cor do curso + área; título (link para o curso; card inteiro clicável via link estendido); docente; "Próxima entrega: dd/mm — título" ou "Concluído"; barra de progresso com `aria-valuenow`; estrela (`aria-pressed`, aria-label "Favoritar {nome}").
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Navegador**: digitar "interacao" letra a letra — foco e cursor permanecem no campo; F5 mantém os filtros; estado vazio → "Limpar filtros" restaura 5 cursos; favoritar persiste após recarregar.

---

### Task 9: Página inicial, Painel e Calendário

**Files:**
- Create: `js/views/home.js`, `js/views/painel.js`, `js/views/calendario.js`
- Modify: `js/ui.js` (reusar `miniCalendar`), `css/styles.css`, `js/app.js`, `tests/views.test.js`

**Interfaces:**
- Consumes: `upcoming`, `courseEvents`, `monthMatrix`, `addMonths`, `courseSummary`, `miniCalendar`, `courseCard`.
- Produces: `App.views.home(ctx)`, `App.views.painel(ctx)`, `App.views.calendario(ctx)`. Calendário: query `?mes=YYYY-MM&curso=id,id&dia=YYYY-MM-DD`; ações `cal-month` (±1 / hoje), `cal-day`, `cal-toggle-course`. Painel: ação `painel-range` (7|30|atrasadas).

- [ ] **Step 1: Testes falhando**

```js
test('home/painel/calendário', () => {
  const App = loadApp();
  const h = App.views.home(mkCtx(App, '#/'));
  assert.match(h, /Rafael/); assert.equal((h.match(/class="site-notice/g) || []).length, 3);
  const p = App.views.painel(mkCtx(App, '#/painel'));
  assert.match(p, /Linha do tempo/); assert.match(p, /Avaliação Cooperativa Planejamento/); assert.match(p, /Acessados recentemente/);
  const c = App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11'));
  assert.match(c, /novembro de 2026/i); assert.equal((c.match(/data-day=/g) || []).length, 42); // 01/11/2026 é domingo
  assert.match(App.views.calendario(mkCtx(App, '#/calendario?mes=2027-01')), /janeiro de 2027/i);
  assert.match(App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11&curso=web')), /Desenvolvimento Web/);
  assert.ok(!/Avaliação Cooperativa/.test(App.views.calendario(mkCtx(App, '#/calendario?mes=2026-11&curso=web'))));
});
```

- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** (§6.1, 6.2, 6.4). Home: saudação "Olá, Rafael", 3 avisos da universidade, "Seus cursos em andamento" (cards compactos), atalho "Ver painel". Painel: Linha do tempo agrupada por dia (Hoje, Amanhã, dd/mm) com filtro 7/30 dias/Atrasadas e estado vazio; Acessados recentemente (3 por `lastAccess`); miniCalendar com todos os cursos + link "Calendário completo". Calendário: grade mensal (células `<button class="btn btn--day" data-day>`), eventos como pílulas na cor do curso (< 680 px viram pontos), legenda/filtro de cursos (chips com `aria-pressed`), ‹ Hoje ›, lateral "Agenda do dia" + "Neste mês".
- [ ] **Step 4: Rodar** → PASS.
- [ ] **Step 5: Navegador**: dez/2026 → › → jan/2027 → ‹ volta; clicar em evento do dia mostra na agenda; Painel "Atrasadas" mostra a atividade de BD.

---

### Task 10: Acabamento, verificação final e README

**Files:**
- Create: `README.md`
- Modify: o que a verificação apontar

- [ ] **Step 1: Rodar** `node --test tests/` → todos PASS.
- [ ] **Step 2: Varredura no navegador** (Playwright MCP) de todas as rotas da §6 da spec em 1280, 768 e 360 px: sem rolagem horizontal, sem erros no console, foco visível percorrendo com Tab em `#/cursos` e `#/curso/ihc`. Tirar screenshot de cada tela em 1280 px para `.superpowers/screens/` (não versionado).
- [ ] **Step 3: Conferir com a spec §10** (critérios de aceite) e com a lista de anti-objetivos §4 — corrigir divergências.
- [ ] **Step 4: README.md**: o que é; como abrir (`index.html` direto ou `python3 -m http.server`); como rodar os testes (`node --test tests/`); como publicar no GitHub Pages (criar repo, push, Settings → Pages → branch `main` / raiz); aviso de dados fictícios.
- [ ] **Step 5: Avisar o usuário** que está pronto e perguntar se quer que inicialize o git, crie o repositório e publique (ação externa — só com confirmação).
