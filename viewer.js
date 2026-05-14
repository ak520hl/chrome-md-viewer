/**
 * Markdown Viewer - 极简优雅风格
 */

// 状态管理
var state = {
  currentDirectory: null,
  directoryStack: [],
  currentFile: null,
  files: [],
  headings: [],
  isSidebarCollapsed: false,
  activeTab: 'files',
  themeColor: 'purple',
  themeMode: 'light',
  typography: 'modern',
  customFontSize: null,
  customLineHeight: null,
  customContentWidth: null
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

  // 返回上级目录按钮
  document.getElementById('parent-directory').addEventListener('click', navigateToParent);

  // 打开上级目录按钮
  document.getElementById('open-parent').addEventListener('click', openParentDirectory);

  // 刷新文件列表按钮
  document.getElementById('refresh-btn').addEventListener('click', refreshFileList);

  // 刷新当前文件按钮
  document.getElementById('refresh-file-btn').addEventListener('click', refreshCurrentFile);

  // 快捷键刷新
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshCurrentFile();
    }
  });

  // 返回顶部按钮
  initBackToTop();

  // 初始化主题切换
  initTheme();

  // 初始化拖动调整大小
  initResize();
}

// 初始化返回顶部
function initBackToTop() {
  var backToTop = document.getElementById('back-to-top');
  var content = document.getElementById('markdown-content');

  content.addEventListener('scroll', function() {
    if (content.scrollTop > 200) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', function() {
    content.scrollTo({ top: 0, behavior: 'smooth' });
  });
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
  var options = {};
  if (state.currentDirectory) {
    options.startIn = state.currentDirectory;
  }

  window.showDirectoryPicker(options).then(function(dir) {
    state.directoryStack = [dir];
    state.currentDirectory = dir;
    loadDirectoryFiles(dir);
    updateParentButton();
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      showError('打开目录失败: ' + err.message);
    }
  });
}

// 返回上级目录
function navigateToParent() {
  if (state.directoryStack.length <= 1) return;

  state.directoryStack.pop();
  var parentDir = state.directoryStack[state.directoryStack.length - 1];
  state.currentDirectory = parentDir;
  loadDirectoryFiles(parentDir);
  updateParentButton();
}

// 打开上级目录（文件系统层面的上级）
function openParentDirectory() {
  if (!state.currentDirectory) return;

  // 使用 startIn 打开目录选择器，定位到当前目录
  window.showDirectoryPicker({ startIn: state.currentDirectory }).then(function(dir) {
    state.directoryStack = [dir];
    state.currentDirectory = dir;
    loadDirectoryFiles(dir);
    updateParentButton();
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      showError('打开目录失败: ' + err.message);
    }
  });
}

// 更新返回上级按钮显示状态
function updateParentButton() {
  var parentBtn = document.getElementById('parent-directory');
  var openParentBtn = document.getElementById('open-parent');

  // 返回上级按钮：有导航历史时显示
  parentBtn.style.display = state.directoryStack.length > 1 ? 'flex' : 'none';

  // 打开上级按钮：已选择目录时显示
  openParentBtn.style.display = state.currentDirectory ? 'flex' : 'none';
}

// 加载目录文件
function loadDirectoryFiles(dir) {
  var filesDiv = document.getElementById('file-list');
  filesDiv.innerHTML = '';

  var files = [];

  readDirectory(dir, files, '').then(function() {
    sortFiles(files);
    state.files = files;
    renderFileList(files);
  });
}

// 排序文件列表：目录在前，文件在后，各自按名称排序
function sortFiles(files) {
  files.sort(function(a, b) {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  files.forEach(function(file) {
    if (file.children) {
      sortFiles(file.children);
    }
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
  li.className = 'tree-node';

  if (file.type === 'directory') {
    var hasChildren = file.children && file.children.length > 0;

    // 创建目录行
    var row = document.createElement('div');
    row.className = 'file-item directory';

    var arrowHtml = hasChildren
      ? '<span class="tree-arrow"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M4 2l4 4-4 4"/></svg></span>'
      : '<span class="tree-arrow-placeholder"></span>';
    var folderHtml = '<span class="folder-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 3.5h12M1 3.5v8.5h12V3.5M4.5 3.5V2h5v1.5"/></svg></span>';
    var navigateHtml = '<span class="navigate-btn" title="进入目录"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6h8M7 3l3 3-3 3"/></svg></span>';

    row.innerHTML = arrowHtml + folderHtml + '<span class="file-name">' + file.name + '</span>' + navigateHtml;
    li.appendChild(row);

    // 创建子目录列表
    if (hasChildren) {
      var childUl = document.createElement('ul');
      childUl.className = 'file-tree-children';
      childUl.style.display = 'none';

      file.children.forEach(function(child) {
        var childLi = createFileListItem(child);
        childUl.appendChild(childLi);
      });

      li.appendChild(childUl);

      // 点击箭头或文件夹名称展开/折叠
      var arrowEl = row.querySelector('.tree-arrow');
      var nameEl = row.querySelector('.file-name');

      if (arrowEl) {
        arrowEl.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleTreeNode(li, childUl);
        });
      }

      if (nameEl) {
        nameEl.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleTreeNode(li, childUl);
        });
      }
    }

    // 点击进入按钮导航到子目录
    var navigateBtn = row.querySelector('.navigate-btn');
    if (navigateBtn) {
      navigateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateToDirectory(file);
      });
    }
  } else {
    // 创建文件行
    var row = document.createElement('div');
    row.className = 'file-item file';

    var fileHtml = '<span class="file-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 1h5.5L11 3.5V13H3V1z"/><path d="M8.5 1v2.5H11"/></svg></span>';
    row.innerHTML = '<span class="tree-arrow-placeholder"></span>' + fileHtml + '<span class="file-name">' + file.name + '</span>';
    li.appendChild(row);

    row.addEventListener('click', function(e) {
      e.stopPropagation();
      openFile(file);
    });
  }

  return li;
}

// 切换树节点展开/折叠
function toggleTreeNode(node, childUl) {
  var isExpanded = childUl.style.display !== 'none';
  childUl.style.display = isExpanded ? 'none' : 'block';
  node.classList.toggle('expanded', !isExpanded);
}

// 导航到子目录
function navigateToDirectory(file) {
  if (file.handle) {
    state.directoryStack.push(file.handle);
    state.currentDirectory = file.handle;
    loadDirectoryFiles(file.handle);
    updateParentButton();
  }
}

// 打开文件
function openFile(file) {
  state.currentFile = file;
  document.getElementById('current-file-name').textContent = file.name;
  document.getElementById('refresh-file-btn').style.display = '';
  loadFileContent(file);
}

// 加载文件内容
function loadFileContent(file) {
  file.handle.getFile().then(function(fileData) {
    return fileData.text();
  }).then(function(text) {
    renderMarkdown(text);
    highlightCurrentFile(file.name);
  }).catch(function(err) {
    showError('读取文件失败: ' + err.message);
  });
}

// 刷新当前文件
function refreshCurrentFile() {
  if (state.currentFile) {
    loadFileContent(state.currentFile);
  }
}

// 刷新文件列表
function refreshFileList() {
  if (state.currentDirectory) {
    loadDirectoryFiles(state.currentDirectory);
  }
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
        },
        code: function(token) {
          // 兼容不同marked版本的参数格式
          var code, language;
          if (typeof token === 'string') {
            code = arguments[0];
            language = arguments[1];
          } else if (token && typeof token === 'object') {
            code = token.text || token.raw || '';
            language = token.lang || token.language || '';
          } else {
            code = String(token || '');
            language = '';
          }

          if (language === 'mermaid') {
            var id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            mermaidQueue.push({ id: id, code: code });
            return '<div class="mermaid" id="' + id + '"></div>';
          }
          return '<pre><code class="language-' + (language || '') + '">' + code + '</code></pre>';
        }
      }
    });

    // 重置mermaid队列
    mermaidQueue = [];

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

  // 渲染Mermaid图表
  renderMermaid();
}

// Mermaid渲染队列
var mermaidQueue = [];

// 渲染Mermaid图表
function renderMermaid() {
  if (mermaidQueue.length === 0) return;

  mermaidQueue.forEach(function(item) {
    var element = document.getElementById(item.id);
    if (!element) return;

    var cleanCode = item.code.trim();
    if (!cleanCode) {
      element.innerHTML = '<pre class="mermaid-error">Mermaid代码为空</pre>';
      return;
    }

    // 直接显示mermaid源码，交给mermaid自动渲染
    element.setAttribute('data-mermaid', cleanCode);
    element.textContent = cleanCode;
  });

  mermaidQueue = [];

  // 初始化并运行mermaid
  try {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 12,
        nodeSpacing: 30,
        rankSpacing: 50
      },
      sequence: {
        useMaxWidth: true,
        actorMargin: 50,
        messageMargin: 35
      },
      themeVariables: {
        primaryColor: '#f5f3ff',
        primaryTextColor: '#1a1a18',
        primaryBorderColor: '#7c3aed',
        lineColor: '#9b9b95',
        secondaryColor: '#ede9fe',
        tertiaryColor: '#fafaf8',
        fontSize: '13px',
        fontFamily: 'IBM Plex Sans, sans-serif',
        nodeBorder: '#7c3aed',
        mainBkg: '#f5f3ff',
        nodeTextColor: '#1a1a18',
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#fafaf8',
        clusterBorder: '#e8e8e4',
        titleColor: '#1a1a18',
        actorTextColor: '#1a1a18',
        actorBorder: '#7c3aed',
        actorBkg: '#f5f3ff',
        signalColor: '#1a1a18',
        signalTextColor: '#1a1a18',
        labelBoxBkgColor: '#f5f3ff',
        labelBoxBorderColor: '#7c3aed',
        labelTextColor: '#1a1a18',
        loopTextColor: '#1a1a18',
        activationBorderColor: '#7c3aed',
        activationBkgColor: '#ede9fe',
        sequenceNumberColor: '#ffffff'
      },
      securityLevel: 'loose'
    });
    mermaid.run();
  } catch (err) {
    console.error('Mermaid运行失败:', err);
  }
}

// Mermaid降级方案
function renderMermaidFallback() {
  mermaidQueue.forEach(function(item) {
    var element = document.getElementById(item.id);
    if (element) {
      element.innerHTML = '<pre class="mermaid-code">' + escapeHtml(item.code.trim()) + '</pre>';
    }
  });
  mermaidQueue = [];
}

// HTML转义
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
    activeTab: state.activeTab,
    themeColor: state.themeColor,
    themeMode: state.themeMode,
    typography: state.typography,
    customFontSize: state.customFontSize,
    customLineHeight: state.customLineHeight,
    customContentWidth: state.customContentWidth
  });
}

// 加载状态
function loadState() {
  chrome.storage.local.get(['isSidebarCollapsed', 'activeTab', 'themeColor', 'themeMode', 'typography', 'customFontSize', 'customLineHeight', 'customContentWidth'], function(result) {
    if (result.isSidebarCollapsed !== undefined) {
      state.isSidebarCollapsed = result.isSidebarCollapsed;
      document.getElementById('sidebar').classList.toggle('collapsed', state.isSidebarCollapsed);
    }

    if (result.activeTab) {
      switchTab(result.activeTab);
    }

    if (result.themeColor) {
      state.themeColor = result.themeColor;
    }
    if (result.themeMode) {
      state.themeMode = result.themeMode;
    }
    if (result.typography) {
      state.typography = result.typography;
    }
    if (result.customFontSize) {
      state.customFontSize = result.customFontSize;
    }
    if (result.customLineHeight) {
      state.customLineHeight = result.customLineHeight;
    }
    if (result.customContentWidth) {
      state.customContentWidth = result.customContentWidth;
    }
    applyTheme();
    applyTypography();
  });
}

// 初始化主题切换
function initTheme() {
  var toggleBtn = document.getElementById('theme-toggle-btn');
  var panel = document.getElementById('theme-panel');

  // 切换面板显示
  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.toggle('visible');
  });

  // 点击外部关闭面板
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== toggleBtn) {
      panel.classList.remove('visible');
    }
  });

  // 明暗切换
  document.querySelectorAll('.mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.themeMode = this.dataset.mode;
      applyTheme();
      saveState();
    });
  });

  // 配色切换
  document.querySelectorAll('.color-dot').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.themeColor = this.dataset.color;
      applyTheme();
      saveState();
    });
  });

  // 排版预设切换
  document.querySelectorAll('.typo-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.typography = this.dataset.typo;
      // 重置自定义值
      state.customFontSize = null;
      state.customLineHeight = null;
      state.customContentWidth = null;
      applyTypography();
      updateSliders();
      saveState();
    });
  });

  // 字号滑块
  var fontSizeSlider = document.getElementById('font-size-slider');
  fontSizeSlider.addEventListener('input', function() {
    state.customFontSize = parseInt(this.value);
    applyTypography();
    saveState();
  });

  // 行高滑块
  var lineHeightSlider = document.getElementById('line-height-slider');
  lineHeightSlider.addEventListener('input', function() {
    state.customLineHeight = parseInt(this.value) / 10;
    applyTypography();
    saveState();
  });

  // 内容宽度滑块
  var contentWidthSlider = document.getElementById('content-width-slider');
  contentWidthSlider.addEventListener('input', function() {
    state.customContentWidth = parseInt(this.value);
    applyTypography();
    saveState();
  });

  // 初始化滑块值
  updateSliders();
}

// 应用主题
function applyTheme() {
  var root = document.documentElement;
  root.setAttribute('data-mode', state.themeMode);
  root.setAttribute('data-color', state.themeColor);

  // 更新按钮激活状态
  document.querySelectorAll('.mode-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.mode === state.themeMode);
  });

  document.querySelectorAll('.color-dot').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.color === state.themeColor);
  });

  // 更新切换图标
  var toggleBtn = document.getElementById('theme-toggle-btn');
  if (state.themeMode === 'dark') {
    toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 8.5A6 6 0 116.5 2 5 5 0 0014 8.5z"/></svg>';
  } else {
    toggleBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>';
  }
}

// 排版预设值
var typoDefaults = {
  modern: { fontSize: 15, lineHeight: 1.7, contentWidth: 720 },
  classic: { fontSize: 16, lineHeight: 1.8, contentWidth: 680 },
  technical: { fontSize: 14, lineHeight: 1.6, contentWidth: 860 },
  comfortable: { fontSize: 18, lineHeight: 2.0, contentWidth: 640 }
};

// 应用排版
function applyTypography() {
  var root = document.documentElement;
  root.setAttribute('data-typography', state.typography);

  // 更新排版按钮状态
  document.querySelectorAll('.typo-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.typo === state.typography);
  });

  // 应用自定义值（覆盖预设）
  var style = document.documentElement.style;
  if (state.customFontSize) {
    style.setProperty('--md-font-size', state.customFontSize + 'px');
  }
  if (state.customLineHeight) {
    style.setProperty('--md-line-height', state.customLineHeight);
  }
  if (state.customContentWidth) {
    style.setProperty('--md-max-width', state.customContentWidth + 'px');
  }

  // 更新滑块显示值
  var fs = state.customFontSize || typoDefaults[state.typography].fontSize;
  var lh = state.customLineHeight || typoDefaults[state.typography].lineHeight;
  var cw = state.customContentWidth || typoDefaults[state.typography].contentWidth;

  document.getElementById('font-size-value').textContent = fs;
  document.getElementById('line-height-value').textContent = lh.toFixed(1);
  document.getElementById('content-width-value').textContent = cw;
}

// 更新滑块位置
function updateSliders() {
  var defaults = typoDefaults[state.typography] || typoDefaults.modern;

  var fs = state.customFontSize || defaults.fontSize;
  var lh = state.customLineHeight || defaults.lineHeight;
  var cw = state.customContentWidth || defaults.contentWidth;

  document.getElementById('font-size-slider').value = fs;
  document.getElementById('line-height-slider').value = Math.round(lh * 10);
  document.getElementById('content-width-slider').value = cw;
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
