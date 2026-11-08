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
    toast: toast,
    SOON: 'Disponível apenas na versão completa do Moodle.',
  };
})(typeof window !== 'undefined' ? window : this);
