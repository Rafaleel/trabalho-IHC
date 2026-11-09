/* Course page: "Curso" tab (sections + sidebar), Plano de ensino and Avisos. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};
  App.actions = App.actions || {};

  function getCourse(ctx) {
    return ctx.course || App.data.courses.filter(function (c) { return c.id === ctx.route.params.id; })[0];
  }

  function isOpen(section, index, course, ctx) {
    var st = ctx.state.openSections[section.id];
    if (st !== undefined) return st;
    if (index === 0) return true;
    var cur = App.logic.currentSection(course, ctx.now);
    return !!cur && cur.id === section.id;
  }

  /* ---------- Summary strip ---------- */
  function summaryStrip(course, ctx) {
    var ui = App.ui, L = App.logic;
    var s = L.courseSummary(course, ctx.now);
    var cells;
    if (course.status === 'concluido') {
      cells = [
        ['check-circle', 'Concluído', 'Semestre ' + course.term],
        ['award', ui.num(s.average), 'Média final'],
        ['list-checks', s.submitted + ' de ' + s.graded, 'atividades entregues'],
      ];
    } else {
      var next = s.nextDue;
      cells = [
        ['list-checks', s.submitted + ' de ' + s.graded, 'atividades entregues'],
        ['clock', next ? L.fmtDate(next.due, 'short') : '—', next ? 'Próxima entrega: ' + next.title : 'Próxima entrega: nenhuma pendente'],
        ['award', ui.num(s.average), 'Média parcial'],
      ];
    }
    return '<div class="summary">' + cells.map(function (c) {
      return '<div class="summary__cell">' + ui.icon(c[0], 'summary__icon') + '<div><p class="summary__value">' + ui.esc(c[1]) + '</p><p class="summary__label">' + ui.esc(c[2]) + '</p></div></div>';
    }).join('') + '<div class="summary__progress" role="progressbar" aria-label="Progresso nas atividades" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.progress + '"><span style="--value: ' + s.progress + '%;"></span></div></div>';
  }

  /* ---------- Sections ---------- */
  function sectionCard(section, index, course, ctx) {
    var ui = App.ui;
    var open = isOpen(section, index, course, ctx);
    var cur = App.logic.currentSection(course, ctx.now);
    var count = section.items.filter(notText).length + (section.subsections || []).reduce(function (n, s) { return n + s.items.filter(notText).length; }, 0);
    var bodyId = 'sec-body-' + section.id;
    var subs = (section.subsections || []).map(function (sub) {
      return '<div class="subsection"><h3 class="subsection__title">' + ui.esc(sub.title) + '</h3>' +
        (sub.items.length ? '<ul class="items">' + sub.items.map(function (it) { return ui.itemRow(it, ctx, course); }).join('') + '</ul>'
          : '<p class="subsection__empty">Nenhum material publicado ainda.</p>') + '</div>';
    }).join('');
    return '<section class="section card' + (cur && cur.id === section.id ? ' section--current' : '') + '" aria-labelledby="sec-title-' + section.id + '">' +
      '<h2 class="section__head">' +
      ui.btn({
        label: section.title, variant: 'ghost', cls: 'section__toggle',
        extra: '',
        attrs: { 'data-action': 'toggle-section', 'data-id': section.id, 'data-section-id': section.id, 'aria-expanded': open ? 'true' : 'false', 'aria-controls': bodyId, id: 'sec-title-' + section.id },
      }).replace('<span>', '<span class="section__chev" aria-hidden="true">' + ui.icon('chevron-down') + '</span><span class="section__title">') +
      '<span class="section__tags">' + (cur && cur.id === section.id ? ui.tag('Esta semana', 'info') : '') +
      (count ? '<span class="section__count">' + count + (count === 1 ? ' item' : ' itens') + '</span>' : '') + '</span>' +
      '</h2>' +
      '<div class="section__body" id="' + bodyId + '"' + (open ? '' : ' hidden') + '>' +
      (section.summary ? '<p class="section__summary">' + ui.esc(section.summary) + '</p>' : '') +
      (section.items.length ? '<ul class="items">' + section.items.map(function (it) { return ui.itemRow(it, ctx, course); }).join('') + '</ul>' : '') +
      subs +
      (!section.items.length && !subs ? '<p class="subsection__empty">Nenhum material publicado ainda.</p>' : '') +
      '</div></section>';
  }
  function notText(i) { return i.type !== 'texto'; }

  /* ---------- Sidebar ---------- */
  function sideMonth(course, ctx) {
    var m = ctx.state.sideMonth[course.id];
    if (m) return m;
    var ref = ctx.now;
    if (course.status === 'concluido') {
      var dues = App.logic.allItems(course).map(function (x) { return x.item.due; }).filter(Boolean).sort();
      ref = dues[dues.length - 1] || ref;
    }
    var d = App.logic.parseDate(ref);
    return { year: d.getFullYear(), month0: d.getMonth() };
  }

  function eventsByDay(events, color) {
    var map = {};
    events.forEach(function (e) { (map[e.date] = map[e.date] || []).push(Object.assign({ color: color }, e)); });
    return map;
  }

  function eventList(events, ctx) {
    var ui = App.ui, L = App.logic;
    return '<ul class="event-list">' + events.map(function (e) {
      var st = e.item ? L.activityStatus(e.item, ctx.now) : null;
      return '<li class="event-list__item"><span class="event-list__date">' + L.fmtDate(e.date, 'short') + '</span>' +
        '<span class="event-list__body"><span class="event-list__title">' + ui.esc(e.title) + '</span>' +
        '<span class="event-list__meta">' + (e.time ? e.time : 'Dia todo') + (st ? ' · ' + ui.statusLabel(st) : '') + '</span></span></li>';
    }).join('') + '</ul>';
  }

  function sidebar(course, ctx) {
    var ui = App.ui, L = App.logic;
    var month = sideMonth(course, ctx);
    var events = L.courseEvents(course);
    var selected = ctx.state.sideDay[course.id] || null;
    var cal = ui.miniCalendar({
      year: month.year, month0: month.month0, today: ctx.now, selected: selected,
      eventsByDay: eventsByDay(events, course.color), monthAction: 'side-month', dayAction: 'side-day', scope: course.id,
    });
    var below;
    if (selected) {
      var dayEvents = events.filter(function (e) { return e.date === selected; });
      below = '<p class="side__subtitle">' + L.fmtDate(selected, 'weekdayDayMonth') + '</p>' +
        (dayEvents.length ? eventList(dayEvents, ctx) : '<p class="side__empty">Nenhuma atividade neste dia.</p>');
    } else {
      var next = events.filter(function (e) { return e.date >= ctx.now.slice(0, 10); }).slice(0, 3);
      below = '<p class="side__subtitle">Próximas entregas</p>' +
        (next.length ? eventList(next, ctx) : '<p class="side__empty">Nenhuma entrega futura.</p>');
    }

    var notices = course.notices.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 3);
    var noticesHtml = '<ul class="side-notices">' + notices.map(function (n) {
      return '<li><p class="side-notices__title">' + ui.esc(n.title) + '</p><p class="side-notices__meta">' + ui.esc(n.author) + ' · ' + L.relative(n.date, ctx.now) + '</p></li>';
    }).join('') + '</ul>';

    var info = [
      ['user', 'Docente', course.teacher.name],
      ['map-pin', 'Sala', course.room],
      ['clock', 'Aulas', course.schedule],
      ['messages', 'Atendimento', course.office],
      ['book', 'Carga horária', course.workload],
    ];

    return '<aside class="course-side" aria-label="Informações complementares do curso">' +
      '<section class="card side-card"><h2 class="card__title">' + ui.icon('calendar') + 'Calendário do curso</h2>' + cal + below + '</section>' +
      '<section class="card side-card"><h2 class="card__title">' + ui.icon('megaphone') + 'Avisos do professor</h2>' + noticesHtml +
      '<a class="link side-card__more" href="' + L.buildHash('curso', { id: course.id, tab: 'avisos' }) + '">Ver todos os avisos' + ui.icon('arrow-right') + '</a></section>' +
      '<section class="card side-card"><h2 class="card__title">' + ui.icon('info') + 'Informações do curso</h2><dl class="info-list">' + info.map(function (r) {
        return '<div class="info-list__row">' + ui.icon(r[0]) + '<div><dt>' + r[1] + '</dt><dd>' + ui.esc(r[2]) + '</dd></div></div>';
      }).join('') + '</dl>' +
      ui.btn({ label: 'Plano de ensino', icon: 'book', variant: 'primary', href: L.buildHash('curso', { id: course.id, tab: 'plano' }), cls: 'btn--block' }) +
      '</section></aside>';
  }

  /* ---------- Tabs ---------- */
  function cursoTab(course, ctx) {
    var ui = App.ui;
    var sections = course.sections.map(function (s, i) { return sectionCard(s, i, course, ctx); }).join('');
    var toolbar = '<div class="course-toolbar"><h2 class="h2">Conteúdo do curso</h2><div class="course-toolbar__actions">' +
      ui.btn({ label: 'Expandir tudo', icon: 'chevrons-expand', size: 'sm', variant: 'ghost', attrs: { 'data-action': 'expand-all', 'data-id': course.id } }) +
      ui.btn({ label: 'Contrair tudo', icon: 'chevrons-collapse', size: 'sm', variant: 'ghost', attrs: { 'data-action': 'collapse-all', 'data-id': course.id } }) +
      '</div></div>';
    return ui.courseHeader(course, 'curso') +
      '<div class="course-layout"><div class="course-main">' + summaryStrip(course, ctx) + toolbar + sections + '</div>' + sidebar(course, ctx) + '</div>';
  }

  function planoTab(course) {
    var ui = App.ui, p = course.plan, esc = ui.esc;
    function list(items, ordered) {
      var tagName = ordered ? 'ol' : 'ul';
      return '<' + tagName + ' class="prose-list">' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</' + tagName + '>';
    }
    return ui.courseHeader(course, null, 'Plano de ensino') +
      '<article class="card plan">' +
      '<div class="plan__head"><h2 class="h2">Plano de ensino</h2><p class="muted">' + esc(course.name) + ' · ' + esc(course.term) + ' · ' + esc(course.teacher.name) + '</p></div>' +
      '<section class="plan__block"><h3 class="h3">Ementa</h3><p>' + esc(p.ementa) + '</p></section>' +
      '<section class="plan__block"><h3 class="h3">Objetivos</h3>' + list(p.objetivos) + '</section>' +
      '<section class="plan__block"><h3 class="h3">Conteúdo programático</h3>' + list(p.conteudo, true) + '</section>' +
      '<section class="plan__block"><h3 class="h3">Metodologia</h3><p>' + esc(p.metodologia) + '</p></section>' +
      '<section class="plan__block"><h3 class="h3">Avaliação</h3><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Instrumento</th><th scope="col" class="num">Peso</th></tr></thead><tbody>' +
      p.avaliacao.map(function (a) { return '<tr><td>' + esc(a.item) + '</td><td class="num">' + a.peso + '%</td></tr>'; }).join('') +
      '</tbody></table></div></section>' +
      '<section class="plan__block"><h3 class="h3">Bibliografia</h3>' + list(p.bibliografia) + '</section>' +
      '<div class="plan__foot">' + ui.btn({ label: 'Voltar ao curso', icon: 'arrow-left', href: App.logic.buildHash('curso', { id: course.id }) }) + '</div>' +
      '</article>';
  }

  function avisosTab(course, ctx) {
    var ui = App.ui, L = App.logic;
    var list = course.notices.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    return ui.courseHeader(course, null, 'Avisos') +
      '<div class="notices-page"><div class="course-toolbar"><h2 class="h2">Avisos do professor</h2>' +
      ui.btn({ label: 'Voltar ao curso', icon: 'arrow-left', size: 'sm', href: L.buildHash('curso', { id: course.id }) }) + '</div>' +
      list.map(function (n) {
        return '<article class="notice"><header class="notice__head"><span class="avatar" aria-hidden="true">' + ui.esc(ui.initials(n.author)) + '</span><div><h3 class="h3">' + ui.esc(n.title) + '</h3>' +
          '<p class="notice__meta">' + ui.esc(n.author) + ' · ' + L.fmtDate(n.date, 'long') + '</p></div></header><p class="notice__body">' + ui.esc(n.body) + '</p></article>';
      }).join('') + '</div>';
  }

  App.views.curso = function (ctx) {
    var course = getCourse(ctx);
    var tab = ctx.route.params.tab;
    if (tab === 'plano') return planoTab(course, ctx);
    if (tab === 'avisos') return avisosTab(course, ctx);
    return cursoTab(course, ctx);
  };

  /* ---------- Actions (browser) ---------- */
  App.actions['toggle-section'] = function (el) {
    var id = el.getAttribute('data-id');
    App.state.openSections[id] = el.getAttribute('aria-expanded') !== 'true';
    App.render();
  };
  function setAll(courseId, open) {
    var c = App.data.courses.filter(function (x) { return x.id === courseId; })[0];
    c.sections.forEach(function (s) { App.state.openSections[s.id] = open; });
    App.render();
  }
  App.actions['expand-all'] = function (el) { setAll(el.getAttribute('data-id'), true); };
  App.actions['collapse-all'] = function (el) { setAll(el.getAttribute('data-id'), false); };
  App.actions['side-month'] = function (el) {
    var id = el.getAttribute('data-id');
    var c = App.data.courses.filter(function (x) { return x.id === id; })[0];
    var cur = sideMonth(c, { state: App.state, now: App.data.today });
    App.state.sideMonth[id] = App.logic.addMonths(cur.year, cur.month0, +el.getAttribute('data-dir'));
    App.state.sideDay[id] = null;
    App.render();
  };
  App.actions['side-day'] = function (el) {
    var id = el.getAttribute('data-id');
    var day = el.getAttribute('data-day');
    App.state.sideDay[id] = App.state.sideDay[id] === day ? null : day;
    App.render();
  };
})(typeof window !== 'undefined' ? window : this);
