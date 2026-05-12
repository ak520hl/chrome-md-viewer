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
    var contentDiv = document.getElementById('content');

    // 使用marked.js渲染Markdown
    if (typeof marked !== 'undefined') {
      var html = marked.parse(text);
      contentDiv.innerHTML = '<div class="markdown-body">' + html + '</div>';
    } else {
      // 如果marked.js未加载，使用简单的渲染
      var html = simpleMarkdownRender(text);
      contentDiv.innerHTML = '<div class="markdown-body">' + html + '</div>';
    }
  }).catch(function(err) {
    document.getElementById('content').innerHTML = '<p style="color: red;">错误: ' + err.message + '</p>';
  });
}

// 简单的Markdown渲染函数
function simpleMarkdownRender(text) {
  var html = text
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 行内代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // 列表
    .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // 包装在段落中
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<p')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('openBtn').addEventListener('click', openDir);
  console.log('页面加载完成');
});
