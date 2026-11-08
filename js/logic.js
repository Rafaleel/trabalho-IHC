/* Pure logic: routing, dates, statuses, filters, calendar. No DOM access. */
(function (root) {
  'use strict';
  var App = (root.App = root.App || {});

  var WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MONTHS_SHORT = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  var COURSE_TABS = ['curso', 'participantes', 'notas', 'atividades', 'plano', 'avisos'];
  var SIMPLE_ROUTES = { '': 'home', painel: 'painel', cursos: 'cursos', calendario: 'calendario' };

  function pad(n) { return String(n).padStart(2, '0'); }

  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ---------- Routing ---------- */

  function parseQuery(qs) {
    var out = {};
    if (!qs) return out;
    qs.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = decodeURIComponent((i < 0 ? pair : pair.slice(0, i)).replace(/\+/g, ' '));
      var v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      if (k) out[k] = v;
    });
    return out;
  }

  function parseRoute(hash) {
    var h = String(hash || '').replace(/^#/, '');
    var qi = h.indexOf('?');
    var pathPart = qi < 0 ? h : h.slice(0, qi);
    var query = parseQuery(qi < 0 ? '' : h.slice(qi + 1));
    var parts = pathPart.split('/').filter(Boolean);

    if (parts.length <= 1 && Object.prototype.hasOwnProperty.call(SIMPLE_ROUTES, parts[0] || '')) {
      return { name: SIMPLE_ROUTES[parts[0] || ''], params: {}, query: query };
    }
    if (parts[0] === 'curso' && (parts.length === 2 || parts.length === 3)) {
      var tab = parts[2] || 'curso';
      if (COURSE_TABS.indexOf(tab) >= 0) {
        return { name: 'curso', params: { id: parts[1], tab: tab }, query: query };
      }
    }
    return { name: 'notfound', params: {}, query: query };
  }

  function buildHash(name, params, query) {
    params = params || {};
    var p;
    if (name === 'home') p = '#/';
    else if (name === 'curso') p = '#/curso/' + params.id + (params.tab && params.tab !== 'curso' ? '/' + params.tab : '');
    else p = '#/' + name;
    var qs = Object.keys(query || {})
      .filter(function (k) { var v = query[k]; return v !== undefined && v !== null && v !== '' && v !== false; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(query[k] === true ? '1' : query[k]); })
      .join('&');
    return qs ? p + '?' + qs : p;
  }

  /* ---------- Dates ---------- */

  function parseDate(iso) {
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return new Date(NaN);
    return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
  }

  function toKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  function fmtDate(iso, style) {
    var d = parseDate(iso);
    switch (style) {
      case 'short': return pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
      case 'full': return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
      case 'long': return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear() + ', ' + hm(d);
      case 'weekdayShort': return WEEKDAYS_SHORT[d.getDay()] + ', ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' às ' + hm(d);
      case 'dayMonth': return d.getDate() + ' de ' + MONTHS[d.getMonth()];
      case 'weekdayDayMonth': return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' de ' + MONTHS[d.getMonth()];
      case 'time': return hm(d);
      default: return toKey(d);
    }
  }

  function dayDiff(aIso, bIso) {
    var a = parseDate(aIso), b = parseDate(bIso);
    var a0 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var b0 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((a0 - b0) / 86400000);
  }

  function relative(iso, nowIso) {
    var d = dayDiff(iso, nowIso);
    if (d === 0) return 'hoje';
    if (d < 0) return 'há ' + -d + ' dia' + (-d === 1 ? '' : 's');
    return 'em ' + d + ' dias';
  }

  function monthLabel(year, month0) {
    return MONTHS[month0] + ' de ' + year;
  }

  App.logic = {
    WEEKDAYS: WEEKDAYS,
    WEEKDAYS_SHORT: WEEKDAYS_SHORT,
    MONTHS: MONTHS,
    COURSE_TABS: COURSE_TABS,
    pad: pad,
    norm: norm,
    parseQuery: parseQuery,
    parseRoute: parseRoute,
    buildHash: buildHash,
    parseDate: parseDate,
    toKey: toKey,
    fmtDate: fmtDate,
    dayDiff: dayDiff,
    relative: relative,
    monthLabel: monthLabel,
  };
})(typeof window !== 'undefined' ? window : this);
