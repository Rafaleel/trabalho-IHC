/* "Meus cursos": course list with search, status, favorites, area, sort and view mode. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};
  App.actions = App.actions || {};
  App.inputs = App.inputs || {};
  App.changes = App.changes || {};

  var SORTS = [['nome', 'Nome (A–Z)'], ['entrega', 'Próxima entrega'], ['progresso', 'Progresso'], ['recente', 'Acessados recentemente']];

  function filtersFrom(query) {
    return {
      q: query.q || '',
      status: query.status || 'andamento',
      area: query.area || 'todas',
      fav: query.fav === '1',
      ordem: query.ordem || 'nome',
    };
  }

  function courseCard(c, ctx) {
    var ui = App.ui, L = App.logic, esc = ui.esc;
    var s = L.courseSummary(c, ctx.now);
    var fav = ctx.state.favs.indexOf(c.id) >= 0;
    var href = L.buildHash('curso', { id: c.id });
    var next = c.status === 'concluido'
      ? '<p class="course-card__next">' + ui.icon('check-circle') + 'Concluído · média final ' + ui.num(s.average) + '</p>'
      : s.nextDue
        ? '<p class="course-card__next">' + ui.icon('clock') + '<span>Próxima entrega <strong>' + L.fmtDate(s.nextDue.due, 'short') + '</strong> · ' + esc(s.nextDue.title) + '</span></p>'
        : '<p class="course-card__next">' + ui.icon('check') + 'Nenhuma entrega pendente</p>';
    return '<article class="course-card card" style="--course: ' + c.color + ';">' +
      '<div class="course-card__band"><span class="course-card__area">' + esc(c.area) + '</span>' +
      ui.btn({
        label: (fav ? 'Remover ' : 'Adicionar ') + c.name + (fav ? ' dos favoritos' : ' aos favoritos'),
        icon: 'star', iconOnly: true, size: 'sm', variant: 'ghost', cls: 'course-card__fav' + (fav ? ' is-on' : ''),
        attrs: { 'data-action': 'toggle-fav', 'data-id': c.id, 'aria-pressed': fav ? 'true' : 'false' },
      }) + '</div>' +
      '<div class="course-card__body">' +
      '<p class="course-card__term">' + esc(c.code + ' · ' + c.term) + '</p>' +
      '<h3 class="course-card__title"><a class="course-card__link" href="' + href + '">' + esc(c.name) + '</a></h3>' +
      '<p class="course-card__meta">' + ui.icon('user') + esc(c.teacher.name) + '</p>' +
      next +
      '<div class="course-card__progress"><div class="course-card__progress-label"><span>Atividades entregues</span><strong>' + s.progress + '%</strong></div>' +
      '<div class="progress" role="progressbar" aria-label="Progresso em ' + esc(c.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.progress + '"><span style="--value: ' + s.progress + '%;"></span></div></div>' +
      '</div></article>';
  }

  function results(ctx) {
    var ui = App.ui, L = App.logic;
    var f = filtersFrom(ctx.route.query);
    var list = L.filterCourses(App.data.courses, f, { favs: ctx.state.favs, now: ctx.now });
    var active = L.activeFilterCount(f);
    var status = '<div class="results-bar"><p class="results-bar__count"><strong>' + list.length + '</strong> ' + (list.length === 1 ? 'curso' : 'cursos') + '</p>' +
      (active ? '<span class="results-bar__sep" aria-hidden="true">·</span><p>' + active + (active === 1 ? ' filtro ativo' : ' filtros ativos') + '</p>' +
        ui.btn({ label: 'Limpar filtros', icon: 'x', size: 'sm', variant: 'ghost', attrs: { 'data-action': 'clear-filters' } }) : '') + '</div>';
    if (!list.length) {
      return status + '<div class="card">' + ui.emptyState('Nenhum curso encontrado', 'Nenhum curso corresponde à busca e aos filtros escolhidos. Tente outro termo ou limpe os filtros.',
        ui.btn({ label: 'Limpar filtros', icon: 'x', variant: 'primary', attrs: { 'data-action': 'clear-filters' } })) + '</div>';
    }
    return status + '<div class="course-grid' + (ctx.state.view === 'lista' ? ' course-grid--list' : '') + '">' +
      list.map(function (c) { return courseCard(c, ctx); }).join('') + '</div>';
  }

  App.views.cursos = function (ctx) {
    var ui = App.ui, D = App.data, esc = ui.esc;
    var f = filtersFrom(ctx.route.query);
    var n = function (st) { return D.courses.filter(function (c) { return st === 'todos' || c.status === st; }).length; };
    var areas = [];
    D.courses.forEach(function (c) { if (areas.indexOf(c.area) < 0) areas.push(c.area); });
    areas.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

    var search = '<label class="field course-filter__search" for="course-q"><span class="field__label">Buscar curso</span><span class="input-wrap">' + ui.icon('search') +
      '<input class="input" id="course-q" type="search" data-input="course-search" placeholder="Nome do curso, docente ou área" autocomplete="off" value="' + esc(f.q) + '">' +
      ui.btn({ label: 'Limpar busca', icon: 'x', iconOnly: true, size: 'sm', variant: 'ghost', attrs: { id: 'course-q-clear', 'data-action': 'clear-search', hidden: !f.q } }) +
      '</span></label>';

    var statusSeg = '<div class="field"><span class="field__label" id="lbl-status">Situação</span>' +
      ui.segmented('Situação', 'set-filter', 'status', [
        { value: 'andamento', label: 'Em andamento (' + n('andamento') + ')' },
        { value: 'concluido', label: 'Concluídos (' + n('concluido') + ')' },
        { value: 'todos', label: 'Todos (' + n('todos') + ')' },
      ], f.status) + '</div>';

    var favBtn = '<div class="field"><span class="field__label">Favoritos</span>' + ui.btn({
      label: 'Só favoritos (' + ctx.state.favs.length + ')', icon: 'star', size: 'md', variant: f.fav ? 'primary' : 'secondary', cls: 'fav-toggle' + (f.fav ? ' is-on' : ''),
      attrs: { 'data-action': 'set-filter', 'data-key': 'fav', 'data-value': f.fav ? '' : '1', 'aria-pressed': f.fav ? 'true' : 'false' },
    }) + '</div>';

    var sort = '<label class="field" for="course-sort"><span class="field__label">Ordenar por</span><select class="select" id="course-sort" data-change="course-sort">' +
      SORTS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === f.ordem ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label>';

    var view = '<div class="field"><span class="field__label">Exibição</span>' + ui.segmented('Exibição', 'set-view', 'view', [
      { value: 'cards', label: 'Cartões' }, { value: 'lista', label: 'Lista' },
    ], ctx.state.view) + '</div>';

    var chips = '<div class="chips" role="group" aria-label="Filtrar por área">' + [['todas', 'Todas as áreas']].concat(areas.map(function (a) { return [a, a]; })).map(function (a) {
      var on = f.area === a[0];
      return ui.btn({ label: a[1], size: 'sm', variant: on ? 'primary' : 'secondary', cls: 'chip', attrs: { 'data-action': 'set-filter', 'data-key': 'area', 'data-value': a[0], 'aria-pressed': on ? 'true' : 'false' } });
    }).join('') + '</div>';

    return ui.pageHead('Ambiente de aprendizagem', 'Meus cursos', 'Encontre seus cursos pelo nome, docente ou área e acompanhe a próxima entrega de cada um.') +
      '<section class="card course-filter" aria-label="Filtros">' +
      '<div class="course-filter__row">' + search + sort + '</div>' +
      '<div class="course-filter__row">' + statusSeg + favBtn + view + '</div>' +
      chips + '</section>' +
      '<div id="course-results" aria-live="polite">' + results(ctx) + '</div>';
  };
  App.views.cursosResults = results;

  /* ---------- Browser handlers ---------- */
  var DEFAULTS = { status: 'andamento', area: 'todas', ordem: 'nome' };
  function patchValue(key, value) {
    var p = {};
    p[key] = DEFAULTS[key] === value ? '' : value;
    return p;
  }
  function refreshResults() {
    var ctx = { App: App, route: App.logic.parseRoute(location.hash), state: App.state, now: App.data.today };
    App.renderRegion('course-results', results(ctx));
  }

  App.inputs['course-search'] = function (el) {
    App.setQuery({ q: el.value }, false);
    var clear = document.getElementById('course-q-clear');
    if (clear) clear.hidden = !el.value;
    refreshResults();
  };
  App.actions['clear-search'] = function () {
    App.setQuery({ q: '' }, false);
    App.render({ focus: '#course-q' });
  };
  App.actions['set-filter'] = function (el) {
    App.setQuery(patchValue(el.getAttribute('data-key'), el.getAttribute('data-value')));
  };
  App.changes['course-sort'] = function (el) { App.setQuery(patchValue('ordem', el.value)); };
  App.actions['set-view'] = function (el) { App.state.view = el.getAttribute('data-value'); App.render(); };
  App.actions['clear-filters'] = function () {
    history.replaceState(null, '', '#/cursos');
    App.render({ focus: '#course-q' });
  };
  App.actions['toggle-fav'] = function (el) {
    App.toggleFav(el.getAttribute('data-id'));
    App.render();
  };
})(typeof window !== 'undefined' ? window : this);
