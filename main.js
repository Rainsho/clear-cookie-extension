function groupBy(arr, prop = 'domain') {
  const ret = {};

  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    const v = c[prop];

    if (!ret[v]) {
      ret[v] = [c];
    } else {
      ret[v].push(c);
    }
  }

  return ret;
}

function removeCookie(cookie) {
  const url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
  chrome.cookies.remove({ url: url, name: cookie.name });
}

chrome.tabs.getSelected(null, tab => {
  if (tab) {
    const { hostname } = new URL(tab.url);
    const topName = hostname.split('.').slice(-2).join('.');

    chrome.cookies.getAll({}, cookies => {
      const current = cookies.filter(x => x.domain.includes(topName));
      const grouped = groupBy(current);

      const table = document.querySelector('#cookies');
      const button = document.querySelector('#remove');

      const trs = Object.keys(grouped)
        .map(k =>
          [`<input type="checkbox" name="${k}" checked>`, k, grouped[k].length]
            .map(c => `<td>${c}</td>`)
            .join('')
        )
        .map(tds => `<tr>${tds}</tr>`)
        .join('');

      table.innerHTML += trs;

      button.addEventListener('click', () => {
        const boxes = document.querySelectorAll('input[type=checkbox]');

        boxes.forEach(box => {
          if (box.checked) {
            (grouped[box.name] || []).forEach(c => removeCookie(c));
            table.removeChild(box.parentNode.parentNode);
          }
        });
      });
    });
  }
});
