/* Reusable HTML components. All functions return strings; only toast() touches the DOM. */
(function (root) {
  'use strict';
  var App = root.App;
  var icon = App.icons.icon;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function attrs(obj) {
    if (!obj) return '';
    return Object.keys(obj)
      .filter(function (k) { return obj[k] !== undefined && obj[k] !== null && obj[k] !== false; })
      .map(function (k) { return obj[k] === true ? ' ' + k : ' ' + k + '="' + esc(obj[k]) + '"'; })
      .join('');
  }

  /* Single button component. Renders a link when `href` is given, otherwise a button element. */
  function btn(o) {
    var variant = o.variant || 'secondary';
    var size = o.size || 'md';
    var cls = 'btn--' + variant + ' btn--' + size + (o.iconOnly ? ' btn--icon' : '') + (o.cls ? ' ' + o.cls : '');
    var inner = (o.icon ? icon(o.icon) : '') + (o.iconOnly ? '' : '<span>' + esc(o.label) + '</span>') + (o.iconAfter ? icon(o.iconAfter) : '') + (o.extra || '');
    var a = Object.assign({}, o.attrs || {});
    if (o.iconOnly) { a['aria-label'] = o.label; a.title = o.label; }
    if (o.href) return '<a href="' + esc(o.href) + '" class="btn ' + cls + '"' + attrs(a) + '>' + inner + '</a>';
    return '<button type="button" class="btn ' + cls + '"' + attrs(a) + '>' + inner + '</button>';
  }

  function tag(text, tone, ic) {
    return '<span class="tag tag--' + (tone || 'neutral') + '">' + (ic ? icon(ic) : '') + esc(text) + '</span>';
  }

  var STATUS = {
    entregue: ['Entregue', 'success', 'check'],
    pendente: ['Pendente', 'warning', 'clock'],
    atrasada: ['Atrasada', 'danger', 'alert'],
    'nao-aberta': ['Não aberta', 'neutral', null],
  };
  function statusTag(status) {
    var s = STATUS[status];
    return s ? tag(s[0], s[1], s[2]) : '';
  }
  function statusLabel(status) { return STATUS[status] ? STATUS[status][0] : ''; }

  /* Icon in a tinted square, colored by item tone. */
  function typeIcon(type) {
    var m = App.data.TYPE_META[type] || App.data.TYPE_META.arquivo;
    return '<span class="type-icon type-icon--' + m.tone + '">' + icon(m.icon || 'align-left') + '</span>';
  }

  function emptyState(title, text, actionHtml) {
    return '<div class="empty">' + icon('inbox', 'empty__icon') + '<p class="empty__title">' + esc(title) + '</p>' +
      (text ? '<p class="empty__text">' + esc(text) + '</p>' : '') + (actionHtml || '') + '</div>';
  }

  function pageHead(eyebrow, title, lead, actionsHtml) {
    return '<header class="page-head"><div>' +
      (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') +
      '<h1 class="page-title">' + esc(title) + '</h1>' +
      (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') +
      '</div>' + (actionsHtml ? '<div class="page-head__actions">' + actionsHtml + '</div>' : '') + '</header>';
  }

  /* Segmented control / toggle group built on .btn. */
  function segmented(label, action, key, options, current) {
    return '<div class="segmented" role="group" aria-label="' + esc(label) + '">' + options.map(function (o) {
      var on = String(o.value) === String(current);
      return btn({ label: o.label, size: 'sm', variant: on ? 'primary' : 'ghost', cls: 'segmented__btn', attrs: { 'data-action': action, 'data-key': key, 'data-value': o.value, 'aria-pressed': on ? 'true' : 'false' } });
    }).join('') + '</div>';
  }

  function toast(msg) {
    if (typeof document === 'undefined') return;
    var region = document.getElementById('toast-region');
    if (!region) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon('info') + '<span>' + esc(msg) + '</span>';
    region.appendChild(el);
    setTimeout(function () { el.classList.add('toast--leave'); }, 2800);
    setTimeout(function () { el.remove(); }, 3200);
  }

  function num(n) { return n == null ? '—' : n.toFixed(1).replace('.', ','); }

  /* Course header: breadcrumb, title, meta and the course tabs. */
  function courseHeader(course, tab, crumbExtra) {
    var L = App.logic;
    var tabs = [['curso', 'Curso'], ['participantes', 'Participantes'], ['notas', 'Notas'], ['atividades', 'Atividades']];
    return '<nav class="breadcrumb" aria-label="Você está aqui"><a href="#/cursos">Meus cursos</a>' + icon('chevron-right') +
      (crumbExtra ? '<a href="' + L.buildHash('curso', { id: course.id }) + '">' + esc(course.name) + '</a>' + icon('chevron-right') + '<span aria-current="page">' + esc(crumbExtra) + '</span>'
        : '<span aria-current="page">' + esc(course.name) + '</span>') + '</nav>' +
      '<header class="course-head" style="--course: ' + course.color + ';">' +
      '<p class="eyebrow">' + esc(course.code + ' · ' + course.area + ' · ' + course.term) + (course.status === 'concluido' ? ' · Concluído' : '') + '</p>' +
      '<h1 class="page-title">' + esc(course.name) + '</h1>' +
      '<p class="course-head__meta">' + icon('user') + esc(course.teacher.name) + '<span aria-hidden="true">·</span>' + icon('clock') + esc(course.schedule) + '</p>' +
      '</header>' +
      '<nav class="tabs" aria-label="Seções do curso">' + tabs.map(function (t) {
        return '<a class="tabs__link" href="' + L.buildHash('curso', { id: course.id, tab: t[0] }) + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
      }).join('') + '</nav>';
  }

  /* One activity/resource row. */
  function itemRow(item, ctx, course) {
    var L = App.logic;
    var meta = App.data.TYPE_META[item.type];
    if (item.type === 'texto') {
      return '<li class="item item--text"><div class="item__text">' + (item.title ? '<p class="item__text-title">' + esc(item.title) + '</p>' : '') +
        (item.text || []).map(function (t) { return '<p>' + t + '</p>'; }).join('') + '</div></li>';
    }
    var status = L.activityStatus(item, ctx.now);
    var lines = [];
    if (item.ref) lines.push('<p class="item__ref">' + esc(item.ref) + '</p>');
    if (item.opens && status === 'nao-aberta') lines.push('<p class="item__meta">' + icon('calendar') + 'Abre em ' + L.fmtDate(item.opens, 'weekdayShort') + '</p>');
    if (item.due) lines.push('<p class="item__meta' + (status === 'atrasada' ? ' item__meta--danger' : '') + '">' + icon('clock') + 'Prazo: ' + L.fmtDate(item.due, 'weekdayShort') + '</p>');
    if (status === 'entregue' && typeof item.grade === 'number') lines.push('<p class="item__meta">' + icon('award') + 'Nota: ' + num(item.grade) + '</p>');
    var titleHref = item.type === 'forum' && item.title === 'Avisos' && course ? L.buildHash('curso', { id: course.id, tab: 'avisos' }) : '#';
    var titleAttrs = titleHref === '#' ? ' data-soon' : '';
    var details = item.instructions && item.instructions.length
      ? '<details class="item__details"><summary>Ver instruções</summary><div class="item__instructions">' + item.instructions.map(function (t) { return '<p>' + t + '</p>'; }).join('') + '</div></details>'
      : '';
    return '<li class="item' + (status ? ' item--' + status : '') + '">' + typeIcon(item.type) +
      '<div class="item__main"><a class="item__title" href="' + titleHref + '"' + titleAttrs + '>' + esc(item.title) + '</a>' + lines.join('') + details + '</div>' +
      '<div class="item__aside">' + (status ? statusTag(status) : tag(meta.label, 'neutral')) + '</div></li>';
  }

  /* Small month calendar used in the course sidebar and the dashboard. */
  function miniCalendar(o) {
    var L = App.logic;
    var keys = L.monthMatrix(o.year, o.month0);
    var todayKey = o.today.slice(0, 10);
    var head = '<div class="cal-mini__head">' +
      btn({ label: 'Mês anterior', icon: 'chevron-left', iconOnly: true, size: 'sm', variant: 'ghost', attrs: { 'data-action': o.monthAction, 'data-id': o.scope, 'data-dir': '-1' } }) +
      '<p class="cal-mini__label" aria-live="polite">' + L.monthLabel(o.year, o.month0) + '</p>' +
      btn({ label: 'Próximo mês', icon: 'chevron-right', iconOnly: true, size: 'sm', variant: 'ghost', attrs: { 'data-action': o.monthAction, 'data-id': o.scope, 'data-dir': '1' } }) +
      '</div>';
    var wd = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(function (d, i) {
      return '<span class="cal-mini__wd" title="' + ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'][i] + '">' + d + '</span>';
    }).join('');
    var days = keys.map(function (k) {
      var evs = o.eventsByDay[k] || [];
      var other = +k.slice(5, 7) !== o.month0 + 1;
      var cls = 'cal-mini__day' + (other ? ' is-other' : '') + (k === todayKey ? ' is-today' : '') + (k === o.selected ? ' is-selected' : '');
      var label = L.fmtDate(k, 'dayMonth') + (evs.length ? ', ' + evs.length + (evs.length === 1 ? ' evento' : ' eventos') : '');
      var dots = evs.length ? '<span class="cal-mini__dots">' + evs.slice(0, 3).map(function (e) {
        return '<span class="cal-mini__dot" style="--dot: ' + (e.color || 'var(--c-primary)') + ';"></span>';
      }).join('') + '</span>' : '';
      return btn({
        label: label, size: 'sm', variant: 'ghost', iconOnly: true, cls: cls,
        extra: '<span aria-hidden="true">' + +k.slice(8) + '</span>' + dots,
        attrs: { 'data-action': o.dayAction, 'data-id': o.scope, 'data-day': k, 'aria-current': k === todayKey ? 'date' : null, 'aria-pressed': k === o.selected ? 'true' : 'false' },
      });
    }).join('');
    return '<div class="cal-mini">' + head + '<div class="cal-mini__grid">' + wd + days + '</div></div>';
  }

  App.ui = {
    esc: esc,
    attrs: attrs,
    icon: icon,
    btn: btn,
    tag: tag,
    statusTag: statusTag,
    statusLabel: statusLabel,
    typeIcon: typeIcon,
    emptyState: emptyState,
    pageHead: pageHead,
    segmented: segmented,
    num: num,
    courseHeader: courseHeader,
    itemRow: itemRow,
    miniCalendar: miniCalendar,
    toast: toast,
    SOON: 'Disponível apenas na versão completa do Moodle.',
  };
})(typeof window !== 'undefined' ? window : this);
