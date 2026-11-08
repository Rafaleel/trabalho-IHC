'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

const SCRIPT_ORDER = [
  'js/icons.js',
  'js/data/base.js',
  'js/data/ihc.js',
  'js/data/web.js',
  'js/data/bd.js',
  'js/data/ia.js',
  'js/data/pi.js',
  'js/data/concluidos.js',
  'js/logic.js',
  'js/ui.js',
  'js/views/shell.js',
  'js/views/notfound.js',
  'js/views/home.js',
  'js/views/painel.js',
  'js/views/cursos.js',
  'js/views/calendario.js',
  'js/views/curso.js',
  'js/views/curso-abas.js',
  'js/app.js',
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function glob(pattern) {
  // Supports "dir/**/*.ext" and plain paths.
  const m = pattern.match(/^(.*)\/\*\*\/\*(\.\w+)$/);
  if (!m) return [pattern];
  const [, dir, ext] = m;
  const out = [];
  const walk = (rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = `${rel}/${e.name}`;
      if (e.isDirectory()) walk(r);
      else if (e.name.endsWith(ext)) out.push(r);
    }
  };
  walk(dir);
  return out.sort();
}

function loadApp(files) {
  const list = (files || SCRIPT_ORDER).filter((f) => fs.existsSync(path.join(ROOT, f)));
  const win = { console };
  win.window = win;
  const ctx = vm.createContext(win);
  for (const f of list) vm.runInContext(read(f), ctx, { filename: f });
  return ctx.App;
}

function defaultState(App) {
  const favs = App.data ? App.data.courses.filter((c) => c.favoriteByDefault).map((c) => c.id) : [];
  return {
    favs,
    openSections: {},
    sideMonth: {},
    sideDay: {},
    calCourses: [],
    painelRange: 7,
    view: 'cards',
    openMenu: null,
  };
}

function mkCtx(App, hash, stateOverrides) {
  return {
    App,
    route: App.logic.parseRoute(hash),
    state: Object.assign(defaultState(App), stateOverrides || {}),
    now: App.data ? App.data.today : '2026-11-08T12:00',
  };
}

function allItems(course) {
  const out = [];
  for (const s of course.sections) {
    out.push(...s.items);
    for (const sub of s.subsections || []) out.push(...sub.items);
  }
  return out;
}

module.exports = { ROOT, SCRIPT_ORDER, read, glob, loadApp, mkCtx, allItems };
