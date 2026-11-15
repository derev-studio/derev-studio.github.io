#!/usr/bin/env node
// Regression-test Russian search against the actual generated merchant index.
'use strict';
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const html = fs.readFileSync(root + '/index.html', 'utf8');
const inline = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
if (!inline) throw new Error('Cannot find the search application script');
new Function(inline); // Parse the full application without opening a browser.
const start = inline.indexOf('function cleanModel(');
const end = inline.indexOf('// Общий механизм для ЛЮБОГО товара.');
if (start < 0 || end <= start) throw new Error('Search function location changed');
const {rankCatalog} = new Function(inline.slice(start, end) + '\nreturn {rankCatalog};')();
const manual = JSON.parse(fs.readFileSync(root + '/catalog.json', 'utf8')).items;
const automatic = JSON.parse(fs.readFileSync(root + '/catalog-auto.json', 'utf8')).items;
const items = [...manual, ...automatic];
const cases = [
  {query: 'отвёртка', min: 15, first: /^מברג/},
  {query: 'рюкзак', min: 5},
  {query: 'плеер', min: 1},
  {query: 'стол', min: 15, first: /^שולחן/},
  {query: 'кресло', min: 1, first: /^כורסה/},
  {query: 'крестовая отвёртка', min: 2, first: /^מברג פיליפס/},
];
for (const test of cases) {
  const results = rankCatalog(items, test.query);
  const first = results[0] && (results[0].name_ru || results[0].name_he || results[0].name || '');
  if (results.length < test.min || (test.first && !test.first.test(first))) {
    throw new Error('Wrong results for ' + test.query + ': ' + results.length + '; first=' + first);
  }
  console.log('PASS:', test.query, results.length, 'first:', first.slice(0, 75));
}
console.log('Russian search regression checks passed over', items.length, 'products.');
