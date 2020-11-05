class Cache {
  constructor() {
    this._cache = {};
  }

  addAll(cookies) {
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i];
      const d = c.domain;

      if (!this._cache[d]) {
        this._cache[d] = [c];
      } else {
        this._cache[d].push(c);
      }
    }
  }

  getDomains() {
    return Object.keys(this._cache);
  }

  getByDomain(domain) {
    return this._cache[domain] || [];
  }

  _removeCookie(cookie) {
    const url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
    chrome.cookies.remove({ url: url, name: cookie.name });
  }

  removeByDomain(domain) {
    this.getByDomain(domain).forEach(cookie => this._removeCookie(cookie));
  }
}

const cache = new Cache();
const table = document.querySelector('#cookies');
const removeBtn = document.querySelector('#remove');
const toggleBtn = document.querySelector('#toggle');
const httpsBtn = document.querySelector('#https');

chrome.tabs.getSelected(null, tab => {
  if (tab) {
    const { hostname } = new URL(tab.url);
    const topName = hostname.split('.').slice(-2).join('.');

    chrome.cookies.getAll({}, cookies => {
      cache.addAll(cookies.filter(x => x.domain.includes(topName)));

      const trs = cache
        .getDomains()
        .map(domain =>
          [
            `<input type="checkbox" name="${domain}" checked>`,
            domain,
            cache.getByDomain(domain).length,
          ]
            .map(td => `<td>${td}</td>`)
            .join('')
        )
        .map(tds => `<tr>${tds}</tr>`)
        .join('');

      table.innerHTML += trs;
    });
  }
});

removeBtn.addEventListener('click', () => {
  const boxes = document.querySelectorAll('input[type=checkbox]');

  boxes.forEach(box => {
    if (box.checked) {
      cache.removeByDomain(box.name);
      box.parentNode.parentNode.remove();
    }
  });
});

toggleBtn.addEventListener('click', () => {
  const boxes = document.querySelectorAll('input[type=checkbox]');

  boxes.forEach(box => {
    box.checked = !box.checked;
  });
});

httpsBtn.addEventListener('click', () => {
  chrome.tabs.getSelected(null, tab => {
    if (tab) {
      const url = new URL(tab.url);

      if (url.protocol === 'http:') {
        url.protocol = 'https:';
        chrome.tabs.update(tab.id, { url: url.href });
      }
    }
  });
});
