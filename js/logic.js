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

  /* ---------- Courses and activities ---------- */

  function allItems(course) {
    var out = [];
    course.sections.forEach(function (s) {
      s.items.forEach(function (item) { out.push({ item: item, section: s, subsection: null }); });
      (s.subsections || []).forEach(function (sub) {
        sub.items.forEach(function (item) { out.push({ item: item, section: s, subsection: sub }); });
      });
    });
    return out;
  }

  function activityStatus(item, nowIso) {
    if (!item || !item.graded) return null;
    if (item.submitted) return 'entregue';
    if (item.opens && item.opens > nowIso) return 'nao-aberta';
    if (item.due && item.due < nowIso) return 'atrasada';
    return 'pendente';
  }

  function courseSummary(course, nowIso) {
    var gradedItems = allItems(course).map(function (x) { return x.item; }).filter(function (i) { return i.graded; });
    var submitted = gradedItems.filter(function (i) { return i.submitted; });
    var pending = gradedItems
      .filter(function (i) { return !i.submitted && i.due && i.due >= nowIso; })
      .sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
    var withGrade = gradedItems.filter(function (i) { return typeof i.grade === 'number'; });
    var wSum = withGrade.reduce(function (s, i) { return s + (i.weight || 1); }, 0);
    var avg = wSum ? withGrade.reduce(function (s, i) { return s + i.grade * (i.weight || 1); }, 0) / wSum : null;
    return {
      graded: gradedItems.length,
      submitted: submitted.length,
      progress: gradedItems.length ? Math.round((submitted.length / gradedItems.length) * 100) : 0,
      nextDue: pending[0] || null,
      average: avg === null ? null : Math.round(avg * 10) / 10,
    };
  }

  function byDue(a, b) { return a.item.due < b.item.due ? -1 : a.item.due > b.item.due ? 1 : 0; }

  /* Graded, not-submitted activities. `days`: due between now and the end of day now+days.
     `lateOnly`: only overdue ones. Default: everything pending from now on. */
  function upcoming(courses, nowIso, opts) {
    opts = opts || {};
    var limit = null;
    if (opts.days) {
      var d = parseDate(nowIso);
      d.setDate(d.getDate() + opts.days);
      limit = toKey(d) + 'T23:59';
    }
    var out = [];
    courses.forEach(function (c) {
      allItems(c).forEach(function (x) {
        var st = activityStatus(x.item, nowIso);
        if (!st || st === 'entregue' || !x.item.due) return;
        if (opts.lateOnly) { if (st === 'atrasada') out.push({ course: c, item: x.item, status: st }); return; }
        if (st === 'atrasada') return;
        if (limit && x.item.due > limit) return;
        out.push({ course: c, item: x.item, status: st });
      });
    });
    return out.sort(byDue);
  }

  function filterCourses(courses, f, ctx) {
    var q = norm(f.q);
    var favs = (ctx && ctx.favs) || [];
    var now = (ctx && ctx.now) || '';
    var items = courses.filter(function (c) {
      if (q && norm(c.name + ' ' + c.shortName + ' ' + c.area + ' ' + c.teacher.name).indexOf(q) < 0) return false;
      if (f.status && f.status !== 'todos' && c.status !== f.status) return false;
      if (f.area && f.area !== 'todas' && c.area !== f.area) return false;
      if (f.fav && favs.indexOf(c.id) < 0) return false;
      return true;
    });
    var sum = {};
    items.forEach(function (c) { sum[c.id] = courseSummary(c, now); });
    var byName = function (a, b) { return a.name.localeCompare(b.name, 'pt-BR'); };
    var cmp = {
      nome: byName,
      entrega: function (a, b) {
        var da = sum[a.id].nextDue ? sum[a.id].nextDue.due : '9999';
        var db = sum[b.id].nextDue ? sum[b.id].nextDue.due : '9999';
        return da < db ? -1 : da > db ? 1 : byName(a, b);
      },
      progresso: function (a, b) { return sum[b.id].progress - sum[a.id].progress || byName(a, b); },
      recente: function (a, b) { return a.lastAccess < b.lastAccess ? 1 : a.lastAccess > b.lastAccess ? -1 : byName(a, b); },
    }[f.ordem] || byName;
    return items.sort(cmp);
  }

  function activeFilterCount(f) {
    var n = 0;
    if (norm(f.q)) n++;
    if (f.status && f.status !== 'andamento') n++;
    if (f.area && f.area !== 'todas') n++;
    if (f.fav) n++;
    return n;
  }

  function currentSection(course, nowIso) {
    var day = nowIso.slice(0, 10);
    for (var i = 0; i < course.sections.length; i++) {
      var s = course.sections[i];
      if (s.start && s.end && s.start <= day && s.end >= day) return s;
    }
    return null;
  }

  function courseEvents(course) {
    var out = [];
    allItems(course).forEach(function (x) {
      if (!x.item.due) return;
      out.push({ date: x.item.due.slice(0, 10), time: x.item.due.slice(11, 16), title: x.item.title, courseId: course.id, itemId: x.item.id, item: x.item });
    });
    (course.events || []).forEach(function (e) {
      out.push({ date: e.date, time: e.time || '', title: e.title, courseId: course.id });
    });
    return out.sort(function (a, b) { var ka = a.date + a.time, kb = b.date + b.time; return ka < kb ? -1 : ka > kb ? 1 : 0; });
  }

  /* ---------- Calendar ---------- */

  /* Day keys for a month grid, Monday first, padded to whole weeks. */
  function monthMatrix(year, month0) {
    var first = new Date(year, month0, 1);
    var offset = (first.getDay() + 6) % 7;
    var days = new Date(year, month0 + 1, 0).getDate();
    var cells = Math.ceil((offset + days) / 7) * 7;
    var out = [];
    for (var i = 0; i < cells; i++) out.push(toKey(new Date(year, month0, 1 - offset + i)));
    return out;
  }

  function addMonths(year, month0, delta) {
    var d = new Date(year, month0 + delta, 1);
    return { year: d.getFullYear(), month0: d.getMonth() };
  }

  App.logic = {
    allItems: allItems,
    activityStatus: activityStatus,
    courseSummary: courseSummary,
    upcoming: upcoming,
    filterCourses: filterCourses,
    activeFilterCount: activeFilterCount,
    currentSection: currentSection,
    courseEvents: courseEvents,
    monthMatrix: monthMatrix,
    addMonths: addMonths,
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
