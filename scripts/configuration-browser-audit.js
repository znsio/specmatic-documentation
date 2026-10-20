// Serve an existing production build with optional browser-observation controls.
// This script is for local acceptance checks; it is not a docs plugin or shipped asset.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../build');
const marker = 'FICTIONAL_CONFIG_PRIVACY_20261009';
const records = [];
const client = `(() => {
  const marker = ${JSON.stringify(marker)};
  const records = [];
  let report;
  const contains = value => typeof value === 'string' && (value.includes(marker) || value.includes(encodeURIComponent(marker)));
  function record(kind, value) {
    records.push({kind, marker: contains(value)});
    if (report) report.value = JSON.stringify(records, null, 2);
  }
  const nativeFetch = window.fetch;
  window.fetch = function(input, init) {
    record('fetch URL', typeof input === 'string' ? input : input?.url);
    record('fetch body', init?.body);
    return nativeFetch.apply(this, arguments);
  };
  for (const method of ['open', 'send', 'setRequestHeader']) {
    const original = XMLHttpRequest.prototype[method];
    XMLHttpRequest.prototype[method] = function(...args) {
      for (const arg of args) record('XHR ' + method, arg);
      return original.apply(this, args);
    };
  }
  const beacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    record('beacon URL', url); record('beacon body', data);
    return beacon.apply(this, arguments);
  };
  for (const method of ['setItem', 'removeItem', 'clear']) {
    const original = Storage.prototype[method];
    Storage.prototype[method] = function(...args) {
      if (!args.length) record('storage ' + method, '');
      for (const arg of args) record('storage ' + method, arg);
      return original.apply(this, args);
    };
  }
  for (const method of ['add', 'put']) {
    const original = IDBObjectStore.prototype[method];
    IDBObjectStore.prototype[method] = function(...args) {
      for (const arg of args) {
        let encoded;
        try { encoded = JSON.stringify(arg); }
        catch { record('indexedDB opaque ' + method, ''); }
        if (encoded !== undefined) record('indexedDB ' + method, encoded);
      }
      return original.apply(this, args);
    };
  }
  let prototype = document;
  while (prototype && !Object.getOwnPropertyDescriptor(prototype, 'cookie')) prototype = Object.getPrototypeOf(prototype);
  const cookie = prototype && Object.getOwnPropertyDescriptor(prototype, 'cookie');
  if (cookie?.get && cookie?.set) Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() { return cookie.get.call(this); },
    set(value) { record('cookie write', value); return cookie.set.call(this, value); }
  });
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) record('resource URL', entry.name);
  }).observe({type: 'resource', buffered: true});
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('details');
    panel.id = 'configuration-audit';
    panel.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:9999;background:white;color:black;border:2px solid black;padding:8px;max-width:380px;font:14px sans-serif';
    const title = document.createElement('summary'); title.textContent = 'Local privacy audit'; panel.append(title);
    report = document.createElement('textarea'); report.id = 'configuration-audit-records'; report.readOnly = true;
    report.setAttribute('aria-label', 'Observed browser operations'); report.style.cssText = 'width:350px;height:180px';
    const reset = document.createElement('button'); reset.textContent = 'Reset browser observations';
    reset.onclick = () => { records.length = 0; report.value = '[]'; };
    const control = document.createElement('button'); control.textContent = 'Run observer control';
    const status = document.createElement('p'); status.setAttribute('role', 'status');
    control.onclick = async () => {
      localStorage.setItem('configuration-audit-control', marker);
      localStorage.removeItem('configuration-audit-control');
      sessionStorage.setItem('configuration-audit-control', marker);
      sessionStorage.removeItem('configuration-audit-control');
      document.cookie = 'configuration-audit-control=' + marker + '; SameSite=Lax';
      document.cookie = 'configuration-audit-control=; Max-Age=0; SameSite=Lax';
      await new Promise((resolve, reject) => {
        const opening = indexedDB.open('configuration-audit-control', 1);
        opening.onupgradeneeded = () => opening.result.createObjectStore('control');
        opening.onerror = () => reject(opening.error);
        opening.onsuccess = () => {
          const database = opening.result;
          const transaction = database.transaction('control', 'readwrite');
          transaction.objectStore('control').put({marker}, 'control');
          const cyclic = {}; cyclic.self = cyclic;
          transaction.objectStore('control').put(cyclic, 'opaque-control');
          transaction.onerror = () => reject(transaction.error);
          transaction.oncomplete = () => {
            database.close();
            const deletion = indexedDB.deleteDatabase('configuration-audit-control');
            deletion.onsuccess = resolve; deletion.onerror = () => reject(deletion.error);
          };
        };
      });
      await fetch('/_audit-probe?marker=' + marker, {method: 'POST', body: marker});
      await new Promise(resolve => {
        const xhr = new XMLHttpRequest(); xhr.open('POST', '/_audit-probe?marker=' + marker);
        xhr.onload = resolve; xhr.send(marker);
      });
      navigator.sendBeacon('/_audit-probe?marker=' + marker, marker);
      status.textContent = 'Observer control completed; temporary storage removed.';
    };
    panel.append(report, reset, control, status); document.body.append(panel);
    report.value = JSON.stringify(records, null, 2);
  });
})();`;
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.ico':'image/x-icon'};
http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let body = '';
  let oversized = false;
  request.on('data', chunk => {
    if (body.length + chunk.length > 1000000) oversized = true;
    if (!oversized) body += chunk;
  });
  request.on('end', () => {
    if (oversized) { response.statusCode=413; response.end(); return; }
    records.push({method:request.method, url:request.url, marker:[request.url, JSON.stringify(request.headers), body].some(value=>value.includes(marker))});
    if (url.pathname === '/_audit-records') {
      response.setHeader('Content-Type','application/json'); response.end(JSON.stringify(records)); return;
    }
    if (url.pathname === '/_audit-reset') { records.length=0; response.end('Reset server observations'); return; }
    if (url.pathname === '/_audit-probe') { response.end('Observer control received'); return; }
    let pathname;
    try { pathname=decodeURIComponent(url.pathname); }
    catch { response.statusCode=400; response.end(); return; }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { response.statusCode=403; response.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
    if (!fs.existsSync(file) && fs.existsSync(file+'.html')) file+='.html';
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.statusCode=404; response.end(); return; }
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control','no-store');
    const content=fs.readFileSync(file);
    response.end(path.extname(file)==='.html' ? content.toString().replace('<head>','<head><script>'+client+'</script>') : content);
  });
}).listen(3021, '127.0.0.1', () => console.log('Local production audit: http://localhost:3021 — fictitious marker only; no requests blocked.'));
