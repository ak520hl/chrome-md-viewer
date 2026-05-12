/**
 * Markdown Viewer - 极简优雅风格
 */

// 状态管理
var state = {
  currentDirectory: null,
  currentFile: null,
  files: [],
  headings: [],
  isSidebarCollapsed: false,
  activeTab: 'files'
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initUI();
  loadState();
  initScrollListener();
});

// 初始化UI
function initUI() {
  // 侧边栏折叠/展开
  document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);

  // Tab切换
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // 打开目录按钮
  document.getElementById('open-directory').addEventListener('click', openDirectory);

  // 初始化拖动调整大小
  initResize();
}

// 初始化拖动调整大小
function initResize() {
  var resizeHandle = document.getElementById('resize-handle');
  var sidebar = document.getElementById('sidebar');
  var container = document.querySelector('.container');
  var isResizing = false;
  var startX = 0;
  var startWidth = 0;

  resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    resizeHandle.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;

    var width = startWidth + (e.clientX - startX);
    var minWidth = 200;
    var maxWidth = window.innerWidth * 0.5;

    if (width < minWidth) width = minWidth;
    if (width > maxWidth) width = maxWidth;

    container.style.gridTemplateColumns = width + 'px auto 1fr';
  });

  document.addEventListener('mouseup', function() {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// 切换侧边栏
function toggleSidebar() {
  state.isSidebarCollapsed = !state.isSidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', state.isSidebarCollapsed);
  saveState();
}

// 切换Tab
function switchTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-panel').forEach(function(panel) {
    panel.classList.toggle('active', panel.id === tabName + '-panel');
  });

  saveState();
}

// 打开目录
function openDirectory() {
  window.showDirectoryPicker().then(function(dir) {
    state.currentDirectory = dir;
    loadDirectoryFiles(dir);
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      showError('打开目录失败: ' + err.message);
    }
  });
}

// 加载目录文件
function loadDirectoryFiles(dir) {
  var filesDiv = document.getElementById('file-list');
  filesDiv.innerHTML = '';

  var files = [];

  readDirectory(dir, files, '').then(function() {
    state.files = files;
    renderFileList(files);
  });
}

// 递归读取目录
function readDirectory(dir, files, path) {
  var entries = dir.values();

  function next() {
    return entries.next().then(function(result) {
      if (result.done) return;

      var entry = result.value;
      var fullPath = path ? path + '/' + entry.name : entry.name;

      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        files.push({
          name: entry.name,
          path: fullPath,
          handle: entry,
          type: 'file'
        });
      } else if (entry.kind === 'directory') {
        var subFiles = [];
        files.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children: subFiles
        });

        return readDirectory(entry, subFiles, fullPath).then(next);
      }

      return next();
    });
  }

  return next();
}

// 渲染文件列表
function renderFileList(files) {
  var fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  if (files.length === 0) {
    fileList.innerHTML = '<p class="placeholder">目录中没有 Markdown 文件</p>';
    return;
  }

  var ul = document.createElement('ul');
  ul.className = 'file-tree';

  files.forEach(function(file) {
    var li = createFileListItem(file);
    ul.appendChild(li);
  });

  fileList.appendChild(ul);
}

// 创建文件列表项
function createFileListItem(file) {
  var li = document.createElement('li');
  li.className = 'file-item ' + file.type;

  if (file.type === 'directory') {
    var hasChildren = file.children && file.children.length > 0;
    var arrowIcon = hasChildren ? '<span class="tree-arrow"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M4 2l4 4-4 4"/></svg></span>' : '<span class="tree-arrow-placeholder"></span>';
    var folderIcon = '<span class="folder-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 3.5h12M1 3.5v8.5h12V3.5M4.5 3.5V2h5v1.5"/></svg></span>';

    li.innerHTML = arrowIcon + folderIcon + '<span class="file-name">' + file.name + '</span>';

    if (hasChildren) {
      var childUl = document.createElement('ul');
      childUl.className = 'file-tree-children';
      childUl.style.display = 'none';

      file.children.forEach(function(child) {
        var childLi = createFileListItem(child);
        childUl.appendChild(childLi);
      });

      li.appendChild(childUl);

      li.addEventListener('click', function(e) {
        e.stopPropagation();
        var isExpanded = childUl.style.display !== 'none';
        childUl.style.display = isExpanded ? 'none' : 'block';
        li.classList.toggle('expanded', !isExpanded);
      });
    }
  } else {
    var fileIcon = '<span class="file-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 1h5.5L11 3.5V13H3V1z"/><path d="M8.5 1v2.5H11"/></svg></span>';
    li.innerHTML = '<span class="tree-arrow-placeholder"></span>' + fileIcon + '<span class="file-name">' + file.name + '</span>';

    li.addEventListener('click', function(e) {
      e.stopPropagation();
      openFile(file);
    });
  }

  return li;
}

// 打开文件
function openFile(file) {
  state.currentFile = file;
  document.getElementById('current-file-name').textContent = file.name;

  file.handle.getFile().then(function(fileData) {
    return fileData.text();
  }).then(function(text) {
    renderMarkdown(text);
    highlightCurrentFile(file.name);
  }).catch(function(err) {
    showError('读取文件失败: ' + err.message);
  });
}

// 渲染Markdown
function renderMarkdown(text) {
  var contentDiv = document.getElementById('markdown-content');

  // 使用marked.js渲染
  if (typeof marked !== 'undefined') {
    var headings = [];

    // 配置marked.js
    marked.use({
      renderer: {
        heading: function(text, level) {
          var id = generateHeadingId(text, headings.length);
          headings.push({
            level: level,
            text: text,
            id: id
          });
          return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>';
        }
      }
    });

    var html = marked.parse(text);
    contentDiv.innerHTML = html;
    state.headings = headings;
  } else {
    var headings = extractHeadings(text);
    state.headings = headings;
    var html = simpleMarkdownRender(text);
    contentDiv.innerHTML = addHeadingIds(html);
  }

  // 渲染TOC
  renderTOC(state.headings);
}

// 提取标题
function extractHeadings(text) {
  var headings = [];
  var lines = text.split('\n');
  var inCodeBlock = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    var match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      var level = match[1].length;
      var headingText = match[2].trim();
      var id = generateHeadingId(headingText, i);

      headings.push({
        level: level,
        text: headingText,
        id: id,
        line: i
      });
    }
  }

  return headings;
}

// 生成标题ID
function generateHeadingId(text, index) {
  var cleanText = text
    .replace(/[^\w一-龥]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return 'heading-' + cleanText + '-' + index;
}

// 为HTML中的标题添加ID
function addHeadingIds(html) {
  var index = 0;
  return html.replace(/<h([1-6])(?:\s[^>]*)?>(.*?)<\/h\1>/gi, function(match, level, text) {
    var id = generateHeadingId(text, index);
    index++;
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>';
  });
}

// 渲染TOC
function renderTOC(headings) {
  var tocList = document.getElementById('toc-list');

  tocList.innerHTML = '';

  if (headings.length === 0) {
    tocList.innerHTML = '<p class="placeholder">没有标题</p>';
    return;
  }

  var ul = document.createElement('ul');
  ul.className = 'toc-tree';

  headings.forEach(function(heading) {
    var li = createTOCItem(heading);
    ul.appendChild(li);
  });

  tocList.appendChild(ul);
}

// 创建TOC项
function createTOCItem(heading) {
  var li = document.createElement('li');
  li.className = 'toc-item level-' + heading.level;
  li.innerHTML = '<a href="#' + heading.id + '" data-heading-id="' + heading.id + '">' + heading.text + '</a>';

  li.addEventListener('click', function(e) {
    e.preventDefault();
    scrollToHeading(heading.id);
  });

  return li;
}

// 滚动到标题位置
function scrollToHeading(headingId) {
  var element = document.getElementById(headingId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    highlightHeading(headingId);
  }
}

// 高亮标题
function highlightHeading(headingId) {
  document.querySelectorAll('.toc-item').forEach(function(item) {
    item.classList.remove('active');
  });

  var tocItem = document.querySelector('.toc-item a[data-heading-id="' + headingId + '"]');
  if (tocItem) {
    tocItem.parentElement.classList.add('active');
  }
}

// 高亮当前文件
function highlightCurrentFile(fileName) {
  document.querySelectorAll('.file-item').forEach(function(item) {
    item.classList.remove('active');
  });

  document.querySelectorAll('.file-name').forEach(function(item) {
    if (item.textContent === fileName) {
      item.parentElement.classList.add('active');
    }
  });
}

// 显示错误信息
function showError(message) {
  var contentDiv = document.getElementById('markdown-content');
  contentDiv.innerHTML = '<div class="error-message">' + message + '</div>';
}

// 简单的Markdown渲染函数
function simpleMarkdownRender(text) {
  var html = text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<p')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

// 保存状态
function saveState() {
  chrome.storage.local.set({
    isSidebarCollapsed: state.isSidebarCollapsed,
    activeTab: state.activeTab
  });
}

// 加载状态
function loadState() {
  chrome.storage.local.get(['isSidebarCollapsed', 'activeTab'], function(result) {
    if (result.isSidebarCollapsed !== undefined) {
      state.isSidebarCollapsed = result.isSidebarCollapsed;
      document.getElementById('sidebar').classList.toggle('collapsed', state.isSidebarCollapsed);
    }

    if (result.activeTab) {
      switchTab(result.activeTab);
    }
  });
}

// 初始化滚动监听
function initScrollListener() {
  var content = document.getElementById('markdown-content');
  if (!content) return;

  var scrollTimeout;

  content.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      updateTOCHighlight();
    }, 100);
  });
}

// 更新TOC高亮
function updateTOCHighlight() {
  var content = document.getElementById('markdown-content');
  if (!content) return;

  var headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  var currentHeading = null;

  headings.forEach(function(heading) {
    var rect = heading.getBoundingClientRect();
    var contentRect = content.getBoundingClientRect();

    if (rect.top >= contentRect.top && rect.top <= contentRect.bottom) {
      currentHeading = heading;
    }
  });

  if (currentHeading) {
    highlightHeading(currentHeading.id);
  }
}
