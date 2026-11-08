/* Global header (logo, main navigation, notifications, messages, user menu). */
(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};

  var NAV = [
    { key: 'home', href: '#/', label: 'Página inicial' },
    { key: 'painel', href: '#/painel', label: 'Painel' },
    { key: 'cursos', href: '#/cursos', label: 'Meus cursos' },
    { key: 'calendario', href: '#/calendario', label: 'Calendário' },
  ];

  function navKey(route) {
    if (route.name === 'curso') return 'cursos';
    return ['home', 'painel', 'cursos', 'calendario'].indexOf(route.name) >= 0 ? route.name : null;
  }

  function menuButton(ctx, menu, iconName, label, badge) {
    var open = ctx.state.openMenu === menu;
    return App.ui.btn({
      label: label, icon: iconName, iconOnly: true, variant: 'ghost', cls: 'topbar__icon-btn',
      extra: badge ? '<span class="badge" aria-hidden="true">' + badge + '</span>' : '',
      attrs: { id: 'menu-btn-' + menu, 'data-action': 'menu', 'data-menu': menu, 'aria-expanded': open ? 'true' : 'false', 'aria-controls': 'menu-' + menu, 'aria-haspopup': 'true' },
    });
  }

  function panel(ctx, menu, title, bodyHtml, footHtml) {
    var open = ctx.state.openMenu === menu;
    return '<div class="dropdown__panel" id="menu-' + menu + '" role="region" aria-label="' + App.ui.esc(title) + '"' + (open ? '' : ' hidden') + '>' +
      '<p class="dropdown__title">' + App.ui.esc(title) + '</p>' + bodyHtml + (footHtml ? '<div class="dropdown__foot">' + footHtml + '</div>' : '') + '</div>';
  }

  function shell(ctx, innerHtml) {
    var D = App.data, ui = App.ui, L = App.logic, esc = ui.esc;
    var active = navKey(ctx.route);
    var navOpen = ctx.state.openMenu === 'nav';

    var navLinks = NAV.map(function (n) {
      return '<li><a class="mainnav__link" href="' + n.href + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' + n.label + '</a></li>';
    }).join('');

    var notif = panel(ctx, 'notif', 'Notificações', '<ul class="menu-list">' + D.notifications.map(function (n) {
      return '<li><a href="#" class="menu-list__item" data-soon>' + ui.icon('bell') + '<span><span class="menu-list__text">' + esc(n.text) + '</span><span class="menu-list__meta">' + L.relative(n.time, ctx.now) + ', ' + L.fmtDate(n.time, 'time') + '</span></span></a></li>';
    }).join('') + '</ul>', '<a href="#" class="link" data-soon>Ver todas as notificações</a>');

    var msgs = panel(ctx, 'msg', 'Mensagens', '<ul class="menu-list">' + D.messages.map(function (m) {
      return '<li><a href="#" class="menu-list__item" data-soon><span class="avatar avatar--sm" aria-hidden="true">' + esc(initials(m.from)) + '</span><span><span class="menu-list__text"><strong>' + esc(m.from) + '</strong></span><span class="menu-list__meta">' + esc(m.preview) + '</span></span></a></li>';
    }).join('') + '</ul>', '<a href="#" class="link" data-soon>Abrir mensagens</a>');

    var user = panel(ctx, 'user', D.user.name, '<ul class="menu-list menu-list--compact">' + [
      ['user', 'Perfil', '#', true],
      ['award', 'Notas', '#', true],
      ['calendar', 'Calendário', '#/calendario', false],
      ['sliders', 'Preferências', '#', true],
      ['log-out', 'Sair', '#', true],
    ].map(function (r) {
      return '<li><a href="' + r[2] + '" class="menu-list__item"' + (r[3] ? ' data-soon' : '') + '>' + ui.icon(r[0]) + '<span class="menu-list__text">' + r[1] + '</span></a></li>';
    }).join('') + '</ul>');

    return '<a class="skip-link" href="#conteudo" data-action="skip">Pular para o conteúdo</a>' +
      '<header class="topbar"><div class="topbar__inner">' +
      ui.btn({ label: navOpen ? 'Fechar menu' : 'Abrir menu', icon: navOpen ? 'x' : 'menu', iconOnly: true, variant: 'ghost', cls: 'topbar__menu-btn', attrs: { id: 'menu-btn-nav', 'data-action': 'menu', 'data-menu': 'nav', 'aria-expanded': navOpen ? 'true' : 'false', 'aria-controls': 'mainnav' } }) +
      '<a class="brand" href="#/"><img src="assets/logo-unipampa.png" alt="Unipampa — Página inicial" width="74" height="50"></a>' +
      '<nav class="mainnav' + (navOpen ? ' is-open' : '') + '" id="mainnav" aria-label="Principal"><ul>' + navLinks + '</ul></nav>' +
      '<div class="topbar__actions">' +
      ui.btn({ label: 'Buscar', icon: 'search', iconOnly: true, variant: 'ghost', cls: 'topbar__icon-btn', attrs: { 'data-soon': true } }) +
      '<div class="dropdown">' + menuButton(ctx, 'notif', 'bell', 'Notificações (' + D.notifications.length + ' novas)', D.notifications.length) + notif + '</div>' +
      '<div class="dropdown">' + menuButton(ctx, 'msg', 'message', 'Mensagens (' + D.messages.length + ')', 0) + msgs + '</div>' +
      '<div class="dropdown">' + App.ui.btn({
        label: 'Menu do usuário', iconOnly: true, variant: 'ghost', cls: 'topbar__user-btn',
        extra: '<span class="avatar" aria-hidden="true">' + esc(D.user.initials) + '</span>' + ui.icon('chevron-down'),
        attrs: { id: 'menu-btn-user', 'data-action': 'menu', 'data-menu': 'user', 'aria-expanded': ctx.state.openMenu === 'user' ? 'true' : 'false', 'aria-controls': 'menu-user', 'aria-haspopup': 'true' },
      }) + user + '</div>' +
      '</div></div></header>' +
      '<main class="main" id="conteudo" tabindex="-1"><div class="container">' + innerHtml + '</div></main>' +
      '<footer class="footer"><div class="container footer__inner"><span>Universidade Federal do Pampa · Moodle</span><a href="#" class="link" data-soon>Contate o suporte do site</a></div></footer>';
  }

  function initials(name) {
    var parts = String(name).replace(/^(Prof\.|Profa\.)\s+/, '').split(/\s+/).filter(function (p) { return /^[A-ZÀ-Ú]/.test(p); });
    return ((parts[0] || '')[0] || '') + ((parts[parts.length - 1] || '')[0] || '');
  }

  App.views.shell = shell;
  App.ui.initials = initials;
})(typeof window !== 'undefined' ? window : this);
