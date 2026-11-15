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


// Grocery and general goods are two sources, not two incompatible search UIs.
// Check real filtering and ensure we never substitute a store homepage for a product.
const relevanceStart = inline.indexOf('function foodRelevant(');
const relevanceEnd = inline.indexOf('function productLabel(', relevanceStart);
if (relevanceStart < 0 || relevanceEnd <= relevanceStart) throw new Error('Food relevancy function missing');
const {foodRelevant} = new Function(
  "const titleOf=p=>p.name;let variation='all';" +
  inline.slice(relevanceStart, relevanceEnd) + "\nreturn {foodRelevant};"
)();
const foodCases = [
  ['fresh chicken', {name:'עוף טרי שלם'}, {chicken:true,term:'עוף'}, true],
  ['chicken soup', {name:'מרק עוף אינסטנט'}, {chicken:true,term:'עוף'}, false],
  ['fresh salmon fillet', {name:'פילה סלמון טרי'}, {salmon:true,fillet:true,term:'פילה סלמון'}, true],
  ['canned salmon', {name:'סלמון בשימורים קופסה'}, {salmon:true,fillet:true,term:'פילה סלמון'}, false],
  ['milk', {name:'חלב טרי 3%'}, {term:'חלב'}, true],
  ['unrelated perfume', {name:'בושם נשים'}, {term:'חלב'}, false]
];
for (const [label, item, meta, expected] of foodCases) {
  if (foodRelevant(item,meta)!==expected) throw new Error('Bad food match: '+label);
}
const compactStart = inline.indexOf('function makeCompactFood(');
const compactEnd = inline.indexOf('function renderMarket(', compactStart);
const compact = inline.slice(compactStart, compactEnd);
if (compactStart < 0 || compactEnd <= compactStart ||
    compact.includes('merchant.site') || compact.includes('searchLink') ||
    compact.includes('Каталог '+String.fromCharCode(39))) {
  throw new Error('Food card redirects into generic store catalogue');
}
if (/showStoreFallback\(q,(true|false)\)/.test(inline)) {
  throw new Error('Store homepages still appear as search result fallback');
}
console.log('PASS: unrelated food filtered, no generic store links in product cards');
