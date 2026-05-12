function openDir() {
  document.getElementById('status').textContent = '正在打开...';

  window.showDirectoryPicker().then(function(dir) {
    document.getElementById('status').textContent = '目录: ' + dir.name;

    var filesDiv = document.getElementById('files');
    filesDiv.innerHTML = '<h3>Markdown文件:</h3>';

    return readDir(dir, filesDiv);
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      document.getElementById('status').textContent = '错误: ' + err.message;
    } else {
      document.getElementById('status').textContent = '已取消';
    }
  });
}

function readDir(dir, filesDiv) {
  var entries = dir.values();

  function next() {
    return entries.next().then(function(result) {
      if (result.done) return;

      var entry = result.value;
      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        var div = document.createElement('div');
        div.style.cssText = 'padding: 8px; margin: 4px 0; background: #f0f0f0; cursor: pointer; border-radius: 4px;';
        div.textContent = entry.name;
        div.onclick = function() { showFile(entry); };
        filesDiv.appendChild(div);
      }

      return next();
    });
  }

  return next();
}

function showFile(fileHandle) {
  fileHandle.getFile().then(function(file) {
    return file.text();
  }).then(function(text) {
    document.getElementById('content').innerHTML = '<h3>' + fileHandle.name + '</h3><pre style="white-space: pre-wrap;">' + text + '</pre>';
  }).catch(function(err) {
    document.getElementById('content').innerHTML = '<p style="color: red;">错误: ' + err.message + '</p>';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('openBtn').addEventListener('click', openDir);
  console.log('页面加载完成');
});
