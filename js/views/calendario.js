/* Full calendar: month grid with events of all courses, course filter and day agenda. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};
  App.actions = App.actions || {};

  var WD = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  function parse(ctx) {
    var q = ctx.route.query;
    var m = /^(\d{4})-(\d{2})$/.exec(q.mes || '');
    var year = +ctx.now.slice(0, 4), month0 = +ctx.now.slice(5, 7) - 1;
    if (m && +m[2] >= 1 && +m[2] <= 12) { year = +m[1]; month0 = +m[2] - 1; }
    var ids = App.data.courses.map(function (c) { return c.id; });
    var sel = (q.curso || '').split(',').filter(function (id) { return ids.indexOf(id) >= 0; });
    var monthKey = year + '-' + App.logic.pad(month0 + 1);
    var day = /^\d{4}-\d{2}-\d{2}$/.test(q.dia || '') && q.dia.slice(0, 7) === monthKey ? q.dia
      : ctx.now.slice(0, 7) === monthKey ? ctx.now.slice(0, 10) : null;
    return { year: year, month0: month0, courses: sel, day: day, monthKey: monthKey };
  }

  function allEvents(courseIds) {
    var L = App.logic, out = [];
    App.data.courses.forEach(function (c) {
      if (courseIds.length && courseIds.indexOf(c.id) < 0) return;
      L.courseEvents(c).forEach(function (e) { out.push(Object.assign({ course: c }, e)); });
    });
    return out.sort(function (a, b) { var ka = a.date + a.time, kb = b.date + b.time; return ka < kb ? -1 : ka > kb ? 1 : 0; });
  }

  function agendaItem(e, ctx, withDate) {
    var ui = App.ui, L = App.logic;
    var st = e.item ? L.activityStatus(e.item, ctx.now) : null;
    return '<li class="agenda__item" style="--course: ' + e.course.color + ';">' +
      (withDate ? '<span class="event-list__date">' + L.fmtDate(e.date, 'short') + '</span>' : '<span class="dot" aria-hidden="true"></span>') +
      '<span class="event-list__body"><a class="event-list__title" href="' + L.buildHash('curso', { id: e.course.id }) + '">' + ui.esc(e.title) + '</a>' +
      '<span class="event-list__meta">' + ui.esc(e.course.name) + (e.time ? ' · ' + e.time : '') + '</span></span>' + (st ? ui.statusTag(st) : '') + '</li>';
  }

  App.views.calendario = function (ctx) {
    var ui = App.ui, L = App.logic, D = App.data, esc = ui.esc;
    var p = parse(ctx);
    var events = allEvents(p.courses);
    var byDay = {};
    events.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
    var todayKey = ctx.now.slice(0, 10);

    var head = '<div class="cal__head"><h2 class="h2 cal__month" aria-live="polite">' + L.monthLabel(p.year, p.month0) + '</h2><div class="cal__nav">' +
      ui.btn({ label: 'Mês anterior', icon: 'chevron-left', iconOnly: true, attrs: { 'data-action': 'cal-month', 'data-dir': '-1' } }) +
      ui.btn({ label: 'Hoje', attrs: { 'data-action': 'cal-month', 'data-dir': '0' } }) +
      ui.btn({ label: 'Próximo mês', icon: 'chevron-right', iconOnly: true, attrs: { 'data-action': 'cal-month', 'data-dir': '1' } }) + '</div></div>';

    var chips = '<div class="chips chips--flat" role="group" aria-label="Mostrar cursos">' + ui.btn({
      label: 'Todos os cursos', size: 'sm', variant: p.courses.length ? 'secondary' : 'primary', cls: 'chip',
      attrs: { 'data-action': 'cal-course', 'data-id': '', 'aria-pressed': p.courses.length ? 'false' : 'true' },
    }) + D.courses.filter(function (c) { return c.status === 'andamento'; }).map(function (c) {
      var on = p.courses.indexOf(c.id) >= 0;
      return ui.btn({
        label: c.name, size: 'sm', variant: on ? 'primary' : 'secondary', cls: 'chip chip--course',
        extra: '', attrs: { 'data-action': 'cal-course', 'data-id': c.id, 'aria-pressed': on ? 'true' : 'false', style: '--course: ' + c.color + ';' },
      }).replace('<span>', '<span class="dot" aria-hidden="true"></span><span>');
    }).join('') + '</div>';

    var grid = WD.map(function (d) { return '<span class="cal__wd" aria-hidden="true">' + d + '</span>'; }).join('') +
      L.monthMatrix(p.year, p.month0).map(function (k) {
        var evs = byDay[k] || [];
        var other = k.slice(0, 7) !== p.monthKey;
        var cls = 'cal__day' + (other ? ' is-other' : '') + (k === todayKey ? ' is-today' : '') + (k === p.day ? ' is-selected' : '');
        var label = L.fmtDate(k, 'weekdayDayMonth') + (evs.length ? ', ' + evs.length + (evs.length === 1 ? ' evento' : ' eventos') : ', sem eventos');
        return ui.btn({
          label: label, variant: 'ghost', iconOnly: true, cls: cls,
          extra: '<span class="cal__num" aria-hidden="true">' + +k.slice(8) + '</span><span class="cal__events" aria-hidden="true">' +
            evs.slice(0, 2).map(function (e) { return '<span class="cal__pill" style="--course: ' + e.course.color + ';">' + esc(e.title) + '</span>'; }).join('') +
            (evs.length > 2 ? '<span class="cal__more">+' + (evs.length - 2) + '</span>' : '') + '</span>',
          attrs: { 'data-action': 'cal-day', 'data-cal-day': k, 'aria-pressed': k === p.day ? 'true' : 'false', 'aria-current': k === todayKey ? 'date' : null },
        });
      }).join('');

    var dayEvents = p.day ? (byDay[p.day] || []) : [];
    var monthEvents = events.filter(function (e) { return e.date.slice(0, 7) === p.monthKey; });
    var dayTitle = p.day ? L.fmtDate(p.day, 'weekdayDayMonth') : 'Nenhum dia selecionado';
    var agenda = '<aside class="stack cal__side"><section class="card side-card"><h2 class="card__title">' + ui.icon('calendar') + 'Agenda do dia</h2><p class="side__subtitle">' + esc(dayTitle) + '</p>' +
      (dayEvents.length ? '<ul class="agenda">' + dayEvents.map(function (e) { return agendaItem(e, ctx, false); }).join('') + '</ul>'
        : '<p class="side__empty">' + (p.day ? 'Nenhum evento neste dia.' : 'Selecione um dia no calendário para ver os eventos.') + '</p>') +
      '</section><section class="card side-card"><h2 class="card__title">' + ui.icon('list') + 'Neste mês</h2>' +
      (monthEvents.length ? '<ul class="agenda">' + monthEvents.map(function (e) { return agendaItem(e, ctx, true); }).join('') + '</ul>' : '<p class="side__empty">Nenhum evento neste mês.</p>') +
      '</section></aside>';

    return ui.pageHead('Planejamento', 'Calendário', 'Entregas e eventos de todos os seus cursos. Clique em um dia para ver a agenda.') +
      '<div class="cal-layout"><section class="card cal">' + head + chips + '<div class="cal__grid">' + grid + '</div></section>' + agenda + '</div>';
  };

  /* ---------- Browser handlers ---------- */
  function current() { return parse({ route: App.logic.parseRoute(location.hash), now: App.data.today }); }
  App.actions['cal-month'] = function (el) {
    var p = current(), dir = +el.getAttribute('data-dir');
    if (dir === 0) { App.setQuery({ mes: '', dia: '' }); return; }
    var m = App.logic.addMonths(p.year, p.month0, dir);
    App.setQuery({ mes: m.year + '-' + App.logic.pad(m.month0 + 1), dia: '' });
  };
  App.actions['cal-day'] = function (el) {
    var k = el.getAttribute('data-cal-day'), p = current();
    var patch = { dia: k };
    if (k.slice(0, 7) !== p.monthKey) patch.mes = k.slice(0, 7);
    App.setQuery(patch);
  };
  App.actions['cal-course'] = function (el) {
    var id = el.getAttribute('data-id'), p = current();
    var list = !id ? [] : p.courses.indexOf(id) >= 0 ? p.courses.filter(function (x) { return x !== id; }) : p.courses.concat(id);
    App.setQuery({ curso: list.join(',') });
  };
})(typeof window !== 'undefined' ? window : this);
