/* App bootstrap: state, routing, rendering and event delegation. */
(function (root) {
  'use strict';
  var App = root.App;
  var L = App.logic;
  var FAV_KEY = 'moodle-proto:favs';

  /* Maps a context to { title, nav, html } — pure, used by tests too. */
  function resolveView(ctx) {
    var r = ctx.route;
    var V = App.views;
    var notfound = { title: 'Página não encontrada', html: V.notfound(ctx) };
    if (r.name === 'notfound') return notfound;
    if (r.name === 'curso') {
      var course = App.data.courses.filter(function (c) { return c.id === r.params.id; })[0];
      if (!course) return notfound;
      ctx.course = course;
      var tabView = { curso: V.curso, plano: V.curso, avisos: V.curso, participantes: V.participantes, notas: V.notas, atividades: V.atividades }[r.params.tab];
      return { title: course.name, html: tabView ? tabView(ctx) : placeholder(course.name) };
    }
    var titles = { home: 'Página inicial', painel: 'Painel', cursos: 'Meus cursos', calendario: 'Calendário' };
    var view = V[r.name];
    return { title: titles[r.name], html: view ? view(ctx) : placeholder(titles[r.name]) };
  }

  function placeholder(title) {
    return App.ui.pageHead('', title, 'Em construção.');
  }

  App.resolveView = resolveView;

  /* ---------------- Browser runtime ---------------- */
  if (typeof document === 'undefined' || !document.getElementById('app')) return;

  var rootEl = document.getElementById('app');
  var lastPath = null;

  function loadFavs() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage unavailable: fall back to defaults */ }
    return App.data.courses.filter(function (c) { return c.favoriteByDefault; }).map(function (c) { return c.id; });
  }
  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(state.favs)); } catch (e) { /* ignore */ }
  }

  var state = {
    favs: loadFavs(),
    openSections: {},
    sideMonth: {},
    sideDay: {},
    calCourses: [],
    painelRange: 7,
    view: 'cards',
    openMenu: null,
  };
  App.state = state;

  function ctx() {
    return { App: App, route: L.parseRoute(location.hash), state: state, now: App.data.today };
  }

  /* Identifies an element so focus can be restored after a full re-render. */
  function focusKey(el) {
    if (!el || el === document.body) return null;
    if (el.id) return '#' + el.id;
    var d = el.dataset || {};
    if (d.action) return '[data-action="' + d.action + '"]' + ['id', 'key', 'value', 'menu', 'dir', 'day'].map(function (k) {
      return d[k] !== undefined ? '[data-' + k + '="' + d[k] + '"]' : '';
    }).join('');
    return null;
  }

  function render(opts) {
    opts = opts || {};
    var c = ctx();
    var key = focusKey(document.activeElement);
    var v = resolveView(c);
    rootEl.innerHTML = App.views.shell(c, v.html);
    document.title = v.title + ' | Moodle Unipampa';
    var path = location.hash.split('?')[0];
    if (opts.routeChange && path !== lastPath) {
      window.scrollTo(0, 0);
      var main = document.getElementById('conteudo');
      if (main && lastPath !== null) main.focus({ preventScroll: true });
    } else if (key) {
      var el = rootEl.querySelector(key);
      if (el) el.focus({ preventScroll: true });
    }
    lastPath = path;
    if (opts.focus) {
      var f = rootEl.querySelector(opts.focus);
      if (f) f.focus();
    }
  }
  App.render = render;

  /* Replaces only the inner HTML of a region (keeps focus in inputs). */
  App.renderRegion = function (id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  /* Updates the query string of the current route without adding history entries. */
  App.setQuery = function (patch, rerender) {
    var r = L.parseRoute(location.hash);
    var q = Object.assign({}, r.query, patch);
    var hash = L.buildHash(r.name, r.params, q);
    history.replaceState(null, '', hash);
    if (rerender !== false) render();
  };

  App.toggleFav = function (id) {
    var i = state.favs.indexOf(id);
    if (i >= 0) state.favs.splice(i, 1); else state.favs.push(id);
    saveFavs();
  };

  /* Click handlers registered by views: App.actions[name](el, event). */
  App.actions = App.actions || {};
  App.actions.menu = function (el) {
    var m = el.getAttribute('data-menu');
    state.openMenu = state.openMenu === m ? null : m;
    render();
    if (state.openMenu && state.openMenu !== 'nav') {
      var first = rootEl.querySelector('#menu-' + m + ' a, #menu-' + m + ' button');
      if (first) first.focus();
    }
  };
  App.actions.skip = function (el, e) {
    e.preventDefault();
    var main = document.getElementById('conteudo');
    if (main) main.focus();
  };

  function closeMenu(returnFocus) {
    if (!state.openMenu) return;
    var m = state.openMenu;
    state.openMenu = null;
    render();
    if (returnFocus) {
      var b = document.getElementById('menu-btn-' + m);
      if (b) b.focus();
    }
  }

  rootEl.addEventListener('click', function (e) {
    var soon = e.target.closest('[data-soon]');
    if (soon) {
      e.preventDefault();
      App.ui.toast(App.ui.SOON);
      return;
    }
    var el = e.target.closest('[data-action]');
    if (state.openMenu && !e.target.closest('.dropdown') && !(el && el.getAttribute('data-action') === 'menu')) {
      var wasNav = state.openMenu === 'nav' && e.target.closest('.mainnav a');
      state.openMenu = null;
      if (!el && !wasNav) { render(); return; }
    }
    if (!el) return;
    var fn = App.actions[el.getAttribute('data-action')];
    if (fn) fn(el, e);
  });

  rootEl.addEventListener('input', function (e) {
    var fn = App.inputs && App.inputs[e.target.getAttribute('data-input')];
    if (fn) fn(e.target, e);
  });
  rootEl.addEventListener('change', function (e) {
    var fn = App.changes && App.changes[e.target.getAttribute('data-change')];
    if (fn) fn(e.target, e);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.openMenu) { e.preventDefault(); closeMenu(true); }
  });

  window.addEventListener('hashchange', function () {
    state.openMenu = null;
    render({ routeChange: true });
  });

  document.body.insertAdjacentHTML('afterbegin', App.icons.sprite);
  render({ routeChange: true });
})(typeof window !== 'undefined' ? window : this);
