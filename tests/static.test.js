'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, read, glob, SCRIPT_ORDER } = require('./helpers');

const SRC = ['index.html', '404.html', 'css/styles.css', ...glob('js/**/*.js')];

test('arquivos principais existem', () => {
  for (const f of ['index.html', '404.html', 'css/styles.css', 'assets/logo-unipampa.png'])
    assert.ok(fs.existsSync(path.join(ROOT, f)), f);
});

test('sem emoji nem símbolos usados como ícone', () => {
  const bad = /[\p{Extended_Pictographic}←-⯿‹›]/u;
  for (const f of SRC) {
    const m = read(f).match(bad);
    assert.ok(!m, `${f}: "${m && m[0]}"`);
  }
});

test('todo <button> tem a classe .btn', () => {
  for (const f of [...glob('js/**/*.js'), 'index.html']) {
    for (const m of read(f).matchAll(/<button\b[^>]*>/g)) {
      assert.match(m[0], /class="[^"]*\bbtn\b/, `${f}: ${m[0]}`);
      assert.match(m[0], /type="button"/, `${f}: botão sem type="button": ${m[0]}`);
    }
  }
});

test('espaçamento e raio só por tokens', () => {
  const css = read('css/styles.css').replace(/:root\s*\{[^}]*\}/g, '');
  for (const m of css.matchAll(/(?:^|[;{\s])((?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?)\s*:\s*([^;}]+)/g)) {
    for (const px of m[2].matchAll(/(-?\d*\.?\d+)px/g)) assert.equal(px[1], '0', `use var(--s-*): ${m[1]}: ${m[2]}`);
  }
  for (const m of css.matchAll(/border-radius\s*:\s*([^;}]+)/g))
    assert.match(m[1].trim(), /^(var\(--r-(sm|md|full)\)|50%|0)$/, `raio fora do token: ${m[1]}`);
});

test('sem estilos inline exceto variáveis de cor/largura', () => {
  for (const f of glob('js/**/*.js'))
    for (const m of read(f).matchAll(/style="([^"]*)"/g))
      assert.match(m[1], /^(--[\w-]+:[^;]+;?\s*)+$/, `${f}: style="${m[1]}"`);
});

test('index carrega todos os scripts, na ordem certa', () => {
  const html = read('index.html');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(ROOT, s)), s);
  assert.deepEqual(srcs, SCRIPT_ORDER.filter((s) => fs.existsSync(path.join(ROOT, s))));
  assert.match(html, /<html lang="pt-BR">/);
});

test('sem textos de bastidor', () => {
  for (const f of SRC)
    for (const s of ['Mockup exclusivo', 'versão V4', 'Mockup próprio', 'Protótipo acadêmico de IHC'])
      assert.ok(!read(f).includes(s), `${s} em ${f}`);
});
