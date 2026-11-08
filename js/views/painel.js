/* Painel: timeline of upcoming work, recently accessed courses and a mini calendar of all courses. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};
  App.actions = App.actions || {};

  function dayLabel(key, nowIso) {
    var L = App.logic;
    var d = L.dayDiff(key, nowIso);
    if (d === 0) return 'Hoje';
    if (d === 1) return 'Amanhã';
    var s = L.fmtDate(key, 'weekdayDayMonth');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function timeline(ctx) {
    var ui = App.ui, L = App.logic, D = App.data, esc = ui.esc;
    var range = ctx.state.painelRange;
    var list = range === 'atrasadas' ? L.upcoming(D.courses, ctx.now, { lateOnly: true }) : L.upcoming(D.courses, ctx.now, { days: range });
    var seg = ui.segmented('Período', 'painel-range', 'range', [
      { value: 7, label: 'Próximos 7 dias' }, { value: 30, label: 'Próximos 30 dias' }, { value: 'atrasadas', label: 'Atrasadas' },
    ], range);
    var body;
    if (!list.length) {
      body = ui.emptyState(range === 'atrasadas' ? 'Nenhuma atividade atrasada' : 'Nada para entregar neste período', range === 'atrasadas' ? 'Você está em dia com todas as entregas.' : 'Experimente ampliar o período para 30 dias.');
    } else {
      var groups = [];
      list.forEach(function (u) {
        var key = u.item.due.slice(0, 10);
        var g = groups[groups.length - 1];
        if (!g || g.key !== key) groups.push(g = { key: key, items: [] });
        g.items.push(u);
      });
      body = groups.map(function (g) {
        return '<div class="timeline__group"><h3 class="timeline__day">' + (range === 'atrasadas' ? L.fmtDate(g.key, 'weekdayDayMonth') : dayLabel(g.key, ctx.now)) + '</h3><ul class="timeline__list">' +
          g.items.map(function (u) {
            return '<li class="timeline__item" style="--course: ' + u.course.color + ';">' + ui.typeIcon(u.item.type) +
              '<div class="timeline__main"><a class="timeline__title" href="' + L.buildHash('curso', { id: u.course.id }) + '">' + esc(u.item.title) + '</a>' +
              '<p class="timeline__meta"><span class="dot" aria-hidden="true"></span>' + esc(u.course.name) + ' · ' + L.fmtDate(u.item.due, 'time') + '</p></div>' +
              ui.statusTag(u.status) + '</li>';
          }).join('') + '</ul></div>';
      }).join('');
    }
    return '<section class="card timeline"><div class="card__head timeline__head"><h2 class="card__title">' + ui.icon('clock') + 'Linha do tempo</h2>' + seg + '</div><div class="card__body">' + body + '</div></section>';
  }

  function recent(ctx) {
    var ui = App.ui, L = App.logic, esc = ui.esc;
    var list = App.data.courses.slice().sort(function (a, b) { return a.lastAccess < b.lastAccess ? 1 : -1; }).slice(0, 3);
    return '<section class="card"><div class="card__head"><h2 class="card__title">' + ui.icon('book') + 'Acessados recentemente</h2><a class="link" href="#/cursos?ordem=recente">Ver todos</a></div>' +
      '<div class="card__body recent-grid">' + list.map(function (c) {
        var s = L.courseSummary(c, ctx.now);
        return '<a class="recent-card" href="' + L.buildHash('curso', { id: c.id }) + '" style="--course: ' + c.color + ';"><span class="recent-card__band"></span>' +
          '<span class="recent-card__area">' + esc(c.area) + '</span><span class="recent-card__title">' + esc(c.name) + '</span>' +
          '<span class="recent-card__meta">Acessado ' + L.relative(c.lastAccess, ctx.now) + '</span>' +
          '<span class="progress" aria-hidden="true"><span style="--value: ' + s.progress + '%;"></span></span></a>';
      }).join('') + '</div></section>';
  }

  function calendarCard(ctx) {
    var ui = App.ui, L = App.logic, D = App.data;
    var m = ctx.state.sideMonth.painel || { year: +ctx.now.slice(0, 4), month0: +ctx.now.slice(5, 7) - 1 };
    var events = [];
    D.courses.forEach(function (c) { L.courseEvents(c).forEach(function (e) { events.push(Object.assign({ color: c.color, course: c }, e)); }); });
    var byDay = {};
    events.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
    var sel = ctx.state.sideDay.painel || null;
    var below = '';
    if (sel) {
      var dayEv = byDay[sel] || [];
      below = '<p class="side__subtitle">' + L.fmtDate(sel, 'weekdayDayMonth') + '</p>' + (dayEv.length ? '<ul class="event-list">' + dayEv.map(function (e) {
        return '<li class="event-list__item" style="--course: ' + e.color + ';"><span class="dot" aria-hidden="true"></span><span class="event-list__body"><span class="event-list__title">' + ui.esc(e.title) + '</span><span class="event-list__meta">' + ui.esc(e.course.shortName) + (e.time ? ' · ' + e.time : '') + '</span></span></li>';
      }).join('') + '</ul>' : '<p class="side__empty">Nenhum evento neste dia.</p>');
    }
    return '<section class="card side-card"><h2 class="card__title">' + ui.icon('calendar') + 'Calendário</h2>' +
      ui.miniCalendar({ year: m.year, month0: m.month0, today: ctx.now, selected: sel, eventsByDay: byDay, monthAction: 'side-month-global', dayAction: 'side-day-global', scope: 'painel' }) +
      below + ui.btn({ label: 'Abrir calendário completo', icon: 'calendar', href: '#/calendario', cls: 'btn--block' }) + '</section>';
  }

  App.views.painel = function (ctx) {
    return App.ui.pageHead('Visão geral', 'Painel', 'O que você precisa entregar e os cursos que acessou por último.') +
      '<div class="dash-layout"><div class="stack">' + timeline(ctx) + recent(ctx) + '</div><aside class="stack">' + calendarCard(ctx) + '</aside></div>';
  };

  App.actions['painel-range'] = function (el) {
    var v = el.getAttribute('data-value');
    App.state.painelRange = v === 'atrasadas' ? v : +v;
    App.render();
  };
  App.actions['side-month-global'] = function (el) {
    var id = el.getAttribute('data-id');
    var now = App.data.today;
    var cur = App.state.sideMonth[id] || { year: +now.slice(0, 4), month0: +now.slice(5, 7) - 1 };
    App.state.sideMonth[id] = App.logic.addMonths(cur.year, cur.month0, +el.getAttribute('data-dir'));
    App.state.sideDay[id] = null;
    App.render();
  };
  App.actions['side-day-global'] = function (el) {
    var id = el.getAttribute('data-id'), day = el.getAttribute('data-day');
    App.state.sideDay[id] = App.state.sideDay[id] === day ? null : day;
    App.render();
  };
})(typeof window !== 'undefined' ? window : this);
