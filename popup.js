document.getElementById('openBtn').onclick = function() {
  chrome.tabs.create({ url: 'viewer.html' });
};
