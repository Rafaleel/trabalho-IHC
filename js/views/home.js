/* Página inicial: greeting, university notices and quick access to current courses. */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};

  App.views.home = function (ctx) {
    var ui = App.ui, L = App.logic, D = App.data, esc = ui.esc;
    var active = D.courses.filter(function (c) { return c.status === 'andamento'; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, 'pt-BR'); });
    var week = L.upcoming(D.courses, ctx.now, { days: 7 });
    var late = L.upcoming(D.courses, ctx.now, { lateOnly: true });

    var courses = '<ul class="quick-list">' + active.map(function (c) {
      var s = L.courseSummary(c, ctx.now);
      return '<li><a class="quick-list__item" href="' + L.buildHash('curso', { id: c.id }) + '" style="--course: ' + c.color + ';">' +
        '<span class="quick-list__dot" aria-hidden="true"></span><span class="quick-list__body"><span class="quick-list__title">' + esc(c.name) + '</span>' +
        '<span class="quick-list__meta">' + (s.nextDue ? 'Próxima entrega ' + L.fmtDate(s.nextDue.due, 'short') + ' · ' + esc(s.nextDue.title) : 'Nenhuma entrega pendente') + '</span></span>' +
        ui.icon('chevron-right') + '</a></li>';
    }).join('') + '</ul>';

    var notices = D.siteNotices.map(function (n) {
      return '<article class="site-notice"><p class="site-notice__date">' + L.fmtDate(n.date, 'full') + '</p><h3 class="h3">' + esc(n.title) + '</h3><p class="muted">' + esc(n.body) + '</p></article>';
    }).join('');

    var today = L.fmtDate(ctx.now, 'weekdayDayMonth') + ' de ' + ctx.now.slice(0, 4);
    return '<section class="hero card"><div><p class="eyebrow">' + esc(today.charAt(0).toUpperCase() + today.slice(1)) + '</p>' +
      '<h1 class="page-title">Olá, ' + esc(D.user.firstName) + '</h1>' +
      '<p class="lead">Você tem <strong>' + week.length + (week.length === 1 ? ' entrega' : ' entregas') + '</strong> nos próximos 7 dias' +
      (late.length ? ' e <strong>' + late.length + ' atividade atrasada</strong>' : '') + '.</p></div>' +
      '<div class="hero__actions">' + ui.btn({ label: 'Abrir painel', icon: 'layout', variant: 'primary', href: '#/painel' }) +
      ui.btn({ label: 'Ver calendário', icon: 'calendar', href: '#/calendario' }) + '</div></section>' +
      '<div class="home-grid">' +
      '<section class="card"><div class="card__head"><h2 class="card__title">' + ui.icon('graduation') + 'Seus cursos em andamento</h2><a class="link" href="#/cursos">Ver todos</a></div><div class="card__body">' + courses + '</div></section>' +
      '<section class="card"><div class="card__head"><h2 class="card__title">' + ui.icon('megaphone') + 'Avisos da universidade</h2></div><div class="card__body site-notices">' + notices + '</div></section>' +
      '</div>';
  };
})(typeof window !== 'undefined' ? window : this);
