/* Course tabs: Participantes, Notas, Atividades. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};
  App.actions = App.actions || {};
  App.inputs = App.inputs || {};
  App.changes = App.changes || {};

  function getCourse(ctx) {
    return ctx.course || App.data.courses.filter(function (c) { return c.id === ctx.route.params.id; })[0];
  }

  function select(label, change, value, options, id) {
    var esc = App.ui.esc;
    return '<label class="field" for="' + id + '"><span class="field__label">' + label + '</span><select class="select" id="' + id + '" data-change="' + change + '">' +
      options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') +
      '</select></label>';
  }

  /* ---------- Participantes ---------- */
  function participantsFiltered(course, q) {
    var L = App.logic;
    var nq = L.norm(q.q);
    return course.participants
      .filter(function (p) { return (!nq || L.norm(p.name).indexOf(nq) >= 0) && (!q.papel || q.papel === 'todos' || p.role === q.papel); })
      .sort(function (a, b) { return (a.role === b.role ? 0 : a.role === 'Professor(a)' ? -1 : 1) || a.name.localeCompare(b.name, 'pt-BR'); });
  }

  function participantsResults(ctx) {
    var ui = App.ui, L = App.logic, course = getCourse(ctx), q = ctx.route.query;
    var list = participantsFiltered(course, q);
    var status = '<p class="results-status">' + list.length + (list.length === 1 ? ' participante' : ' participantes') + '</p>';
    if (!list.length) {
      return status + ui.emptyState('Nenhum participante encontrado', 'Confira a grafia do nome ou mude o filtro de papel.',
        ui.btn({ label: 'Limpar filtros', icon: 'x', attrs: { 'data-action': 'tab-clear' } }));
    }
    return status + '<div class="table-wrap card"><table class="table table--people"><thead><tr><th scope="col">Nome</th><th scope="col">Papel</th><th scope="col">Último acesso ao curso</th></tr></thead><tbody>' +
      list.map(function (p) {
        var me = p.name === App.data.user.name;
        return '<tr class="person"><td><span class="person__name"><span class="avatar avatar--sm" aria-hidden="true">' + ui.esc(ui.initials(p.name)) + '</span>' + ui.esc(p.name) +
          (me ? ' ' + ui.tag('Você', 'info') : '') + '</span></td><td>' + (p.role === 'Professor(a)' ? ui.tag(p.role, 'success') : ui.esc(p.role)) + '</td>' +
          '<td class="muted">' + L.relative(p.lastAccess, ctx.now) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  App.views.participantes = function (ctx) {
    var ui = App.ui, course = getCourse(ctx), q = ctx.route.query;
    return ui.courseHeader(course, 'participantes') +
      '<div class="filters card"><label class="field filters__search" for="part-q"><span class="field__label">Buscar participante</span><span class="input-wrap">' + ui.icon('search') +
      '<input class="input" id="part-q" type="search" data-input="part-search" placeholder="Nome do participante" autocomplete="off" value="' + ui.esc(q.q || '') + '"></span></label>' +
      select('Papel', 'part-papel', q.papel || 'todos', [['todos', 'Todos'], ['Professor(a)', 'Professor(a)'], ['Estudante', 'Estudante']], 'part-papel') +
      '</div><div id="tab-results" aria-live="polite">' + participantsResults(ctx) + '</div>';
  };
  App.views.participantesResults = participantsResults;

  /* ---------- Notas ---------- */
  App.views.notas = function (ctx) {
    var ui = App.ui, L = App.logic, course = getCourse(ctx);
    var s = L.courseSummary(course, ctx.now);
    var rows = L.allItems(course).filter(function (x) { return x.item.graded; });
    var final = course.status === 'concluido';
    return ui.courseHeader(course, 'notas') +
      '<div class="grades-head"><div><h2 class="h2">Relatório de notas</h2><p class="muted">Notas de 0 a 10. A média é ponderada pelo peso de cada atividade avaliada.</p></div>' +
      '<div class="grades-avg"><p class="summary__label">' + (final ? 'Média final' : 'Média parcial') + '</p><p class="grades-avg__value">' + ui.num(s.average) + '</p></div></div>' +
      '<div class="table-wrap card"><table class="table table--grades"><thead><tr><th scope="col">Atividade</th><th scope="col" class="num">Peso</th><th scope="col" class="num">Nota</th><th scope="col">Situação</th><th scope="col">Comentário</th></tr></thead><tbody>' +
      rows.map(function (x) {
        var it = x.item, st = L.activityStatus(it, ctx.now);
        return '<tr class="grade-row grade-row--' + st + '"><td><span class="grade-row__title">' + ui.esc(it.title) + '</span><span class="grade-row__sub">' + ui.esc(x.section.title) +
          (it.due ? ' · prazo ' + L.fmtDate(it.due, 'short') : '') + '</span></td>' +
          '<td class="num">' + it.weight + '</td><td class="num grade-row__grade">' + ui.num(typeof it.grade === 'number' ? it.grade : null) + '</td>' +
          '<td>' + ui.statusTag(st) + '</td><td class="muted">' + ui.esc(it.feedback || '—') + '</td></tr>';
      }).join('') +
      '</tbody><tfoot><tr><th scope="row">' + (final ? 'Média final' : 'Média parcial') + '</th><td></td><td class="num grade-row__grade">' + ui.num(s.average) + '</td><td colspan="2" class="muted">' + s.submitted + ' de ' + s.graded + ' atividades avaliadas</td></tr></tfoot></table></div>';
  };

  /* ---------- Atividades ---------- */
  var GROUPS = [
    ['atrasada', 'Atrasadas', 'alert'],
    ['proximas', 'Próximas', 'clock'],
    ['entregue', 'Concluídas', 'check-circle'],
  ];

  function activitiesResults(ctx) {
    var ui = App.ui, L = App.logic, course = getCourse(ctx), q = ctx.route.query;
    var tipo = q.tipo || 'todos', situacao = q.situacao || 'todas';
    var list = L.allItems(course).filter(function (x) {
      if (!x.item.graded) return false;
      var st = L.activityStatus(x.item, ctx.now);
      return (tipo === 'todos' || x.item.type === tipo) && (situacao === 'todas' || st === situacao);
    });
    if (!list.length) {
      return ui.emptyState('Nenhuma atividade encontrada', 'Nenhuma atividade corresponde aos filtros escolhidos.',
        ui.btn({ label: 'Limpar filtros', icon: 'x', attrs: { 'data-action': 'tab-clear' } }));
    }
    var byDue = function (a, b) { return (a.item.due || '9999') < (b.item.due || '9999') ? -1 : 1; };
    return GROUPS.map(function (g) {
      var items = list.filter(function (x) {
        var st = L.activityStatus(x.item, ctx.now);
        return g[0] === 'proximas' ? st === 'pendente' || st === 'nao-aberta' : st === g[0];
      }).sort(byDue);
      if (g[0] === 'entregue') items.reverse();
      if (!items.length) return '';
      return '<section class="card act-group act-group--' + g[0] + '"><h2 class="card__title act-group__title">' + ui.icon(g[2]) + g[1] + '<span class="section__count">' + items.length + '</span></h2>' +
        '<ul class="items">' + items.map(function (x) { return ui.itemRow(x.item, ctx, course); }).join('') + '</ul></section>';
    }).join('');
  }

  App.views.atividades = function (ctx) {
    var ui = App.ui, course = getCourse(ctx), q = ctx.route.query, D = App.data;
    var types = [];
    App.logic.allItems(course).forEach(function (x) { if (x.item.graded && types.indexOf(x.item.type) < 0) types.push(x.item.type); });
    return ui.courseHeader(course, 'atividades') +
      '<div class="filters card">' +
      select('Tipo', 'act-tipo', q.tipo || 'todos', [['todos', 'Todos os tipos']].concat(types.map(function (t) { return [t, D.TYPE_META[t].label]; })), 'act-tipo') +
      select('Situação', 'act-situacao', q.situacao || 'todas', [['todas', 'Todas'], ['pendente', 'Pendente'], ['atrasada', 'Atrasada'], ['nao-aberta', 'Não aberta'], ['entregue', 'Entregue']], 'act-situacao') +
      '</div><div id="tab-results" class="stack" aria-live="polite">' + activitiesResults(ctx) + '</div>';
  };
  App.views.atividadesResults = activitiesResults;

  /* ---------- Browser handlers ---------- */
  function refresh(viewName) {
    var ctx = { App: App, route: App.logic.parseRoute(location.hash), state: App.state, now: App.data.today };
    App.renderRegion('tab-results', App.views[viewName](ctx));
  }
  App.inputs['part-search'] = function (el) { App.setQuery({ q: el.value }, false); refresh('participantesResults'); };
  App.changes['part-papel'] = function (el) { App.setQuery({ papel: el.value === 'todos' ? '' : el.value }, false); refresh('participantesResults'); };
  App.changes['act-tipo'] = function (el) { App.setQuery({ tipo: el.value === 'todos' ? '' : el.value }, false); refresh('atividadesResults'); };
  App.changes['act-situacao'] = function (el) { App.setQuery({ situacao: el.value === 'todas' ? '' : el.value }, false); refresh('atividadesResults'); };
  App.actions['tab-clear'] = function () {
    var r = App.logic.parseRoute(location.hash);
    history.replaceState(null, '', App.logic.buildHash(r.name, r.params, {}));
    App.render();
  };
})(typeof window !== 'undefined' ? window : this);
