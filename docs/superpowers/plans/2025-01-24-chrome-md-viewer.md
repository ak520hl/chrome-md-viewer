# Chrome Markdown Viewer 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个Chrome浏览器插件，用于浏览本地Markdown文档库，支持GitHub风格渲染和目录导航。

**Architecture:** 使用Chrome Extension + File System Access API读取本地文件，marked.js解析Markdown，highlight.js实现代码高亮，三栏布局（侧边栏、内容区、TOC）。

**Tech Stack:** Chrome Extension, marked.js, highlight.js, GitHub Markdown CSS, File System Access API

---

## 文件结构

```
chrome-md-viewer/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台脚本
├── viewer.html            # 主界面HTML
├── viewer.css             # 主界面样式
├── viewer.js              # 主界面逻辑
├── file-system.js         # 文件系统操作封装
├── markdown-parser.js     # Markdown解析和TOC生成
├── ui-components.js       # UI组件（侧边栏、TOC等）
├── libs/
│   ├── marked.min.js      # Markdown解析库
│   ├── highlight.min.js   # 代码高亮库
│   └── github-markdown.css # GitHub风格样式
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## Task 1: 创建Chrome Extension基础结构

**Files:**
- Create: `chrome-md-viewer/manifest.json`
- Create: `chrome-md-viewer/background.js`
- Create: `chrome-md-viewer/viewer.html`

- [ ] **Step 1: 创建manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Markdown Viewer",
  "version": "1.0.0",
  "description": "浏览本地Markdown文档库，支持GitHub风格渲染和目录导航",
  "permissions": [
    "storage"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "viewer.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

- [ ] **Step 2: 创建background.js**

```javascript
// 后台脚本
chrome.runtime.onInstalled.addListener(() => {
  console.log('Markdown Viewer 已安装');
});

// 存储最近打开的目录
chrome.storage.local.get(['lastDirectory'], (result) => {
  if (result.lastDirectory) {
    console.log('最近打开的目录:', result.lastDirectory);
  }
});
```

- [ ] **Step 3: 创建viewer.html基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Viewer</title>
  <link rel="stylesheet" href="libs/github-markdown.css">
  <link rel="stylesheet" href="viewer.css">
</head>
<body>
  <div class="container">
    <!-- 侧边栏 -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <button id="toggle-sidebar" class="toggle-btn">☰</button>
        <span class="sidebar-title">Markdown Viewer</span>
      </div>
      <div class="sidebar-tabs">
        <button class="tab-btn active" data-tab="files">📁 文件列表</button>
        <button class="tab-btn" data-tab="toc">📑 目录</button>
      </div>
      <div class="sidebar-content">
        <div class="tab-panel active" id="files-panel">
          <div id="file-list" class="file-list">
            <p class="placeholder">点击"打开目录"按钮选择文件夹</p>
          </div>
        </div>
        <div class="tab-panel" id="toc-panel">
          <div id="toc-list" class="toc-list">
            <p class="placeholder">打开Markdown文件后显示目录</p>
          </div>
        </div>
      </div>
      <div class="sidebar-footer">
        <button id="open-directory" class="primary-btn">打开目录</button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <div class="content-header">
        <h1 id="current-file-name">未选择文件</h1>
      </div>
      <div id="markdown-content" class="markdown-body">
        <p class="placeholder">请从左侧选择一个Markdown文件</p>
      </div>
    </main>

    <!-- 右侧目录 -->
    <aside class="toc-sidebar" id="toc-sidebar">
      <div class="toc-header">
        <h2>📑 目录</h2>
      </div>
      <div id="toc-tree" class="toc-tree">
        <p class="placeholder">打开Markdown文件后显示目录</p>
      </div>
    </aside>
  </div>

  <script src="libs/marked.min.js"></script>
  <script src="libs/highlight.min.js"></script>
  <script src="file-system.js"></script>
  <script src="markdown-parser.js"></script>
  <script src="ui-components.js"></script>
  <script src="viewer.js"></script>
</body>
</html>
```

- [ ] **Step 4: 验证文件创建**

运行: `ls -la chrome-md-viewer/`
Expected: 看到 manifest.json, background.js, viewer.html 文件

- [ ] **Step 5: 提交代码**

```bash
cd chrome-md-viewer
git init
git add manifest.json background.js viewer.html
git commit -m "feat: 创建Chrome Extension基础结构"
```

---

## Task 2: 下载第三方库

**Files:**
- Create: `chrome-md-viewer/libs/marked.min.js`
- Create: `chrome-md-viewer/libs/highlight.min.js`
- Create: `chrome-md-viewer/libs/github-markdown.css`

- [ ] **Step 1: 创建libs目录**

```bash
mkdir -p chrome-md-viewer/libs
```

- [ ] **Step 2: 下载marked.js**

```bash
curl -L https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js -o chrome-md-viewer/libs/marked.min.js
```

- [ ] **Step 3: 下载highlight.js**

```bash
curl -L https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js -o chrome-md-viewer/libs/highlight.min.js
```

- [ ] **Step 4: 下载GitHub Markdown CSS**

```bash
curl -L https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css -o chrome-md-viewer/libs/github-markdown.css
```

- [ ] **Step 5: 验证下载**

```bash
ls -la chrome-md-viewer/libs/
```

Expected: 看到三个文件，每个文件大小大于0

- [ ] **Step 6: 提交代码**

```bash
cd chrome-md-viewer
git add libs/
git commit -m "feat: 下载第三方库 (marked.js, highlight.js, github-markdown-css)"
```

---

## Task 3: 实现文件系统操作封装

**Files:**
- Create: `chrome-md-viewer/file-system.js`

- [ ] **Step 1: 创建file-system.js**

```javascript
/**
 * 文件系统操作封装
 * 使用File System Access API读取本地文件和目录
 */

class FileSystemManager {
  constructor() {
    this.currentDirectory = null;
    this.currentFile = null;
  }

  /**
   * 打开目录选择器
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async openDirectory() {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      this.currentDirectory = directoryHandle;
      return directoryHandle;
    } catch (error) {
      if (error.name === 'AbortError') {
        // 用户取消选择
        return null;
      }
      throw error;
    }
  }

  /**
   * 读取目录下的所有.md文件
   * @param {FileSystemDirectoryHandle} directoryHandle
   * @returns {Promise<Array>}
   */
  async readDirectory(directoryHandle = this.currentDirectory) {
    if (!directoryHandle) {
      throw new Error('未选择目录');
    }

    const files = [];

    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        files.push({
          name: entry.name,
          handle: entry,
          type: 'file'
        });
      } else if (entry.kind === 'directory') {
        const subFiles = await this.readDirectory(entry);
        files.push({
          name: entry.name,
          type: 'directory',
          children: subFiles
        });
      }
    }

    return files;
  }

  /**
   * 读取文件内容
   * @param {FileSystemFileHandle} fileHandle
   * @returns {Promise<string>}
   */
  async readFile(fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      this.currentFile = fileHandle;
      return text;
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }

  /**
   * 获取当前目录句柄
   * @returns {FileSystemDirectoryHandle|null}
   */
  getCurrentDirectory() {
    return this.currentDirectory;
  }

  /**
   * 获取当前文件句柄
   * @returns {FileSystemFileHandle|null}
   */
  getCurrentFile() {
    return this.currentFile;
  }
}

// 导出单例
window.fileSystemManager = new FileSystemManager();
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/file-system.js
```

Expected: 看到完整的JavaScript代码

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add file-system.js
git commit -m "feat: 实现文件系统操作封装"
```

---

## Task 4: 实现Markdown解析和TOC生成

**Files:**
- Create: `chrome-md-viewer/markdown-parser.js`

- [ ] **Step 1: 创建markdown-parser.js**

```javascript
/**
 * Markdown解析和TOC生成
 * 使用marked.js解析Markdown，提取标题生成TOC
 */

class MarkdownParser {
  constructor() {
    this.headings = [];
    this.initMarked();
  }

  /**
   * 初始化marked.js配置
   */
  initMarked() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (e) {
              console.error('代码高亮错误:', e);
            }
          }
          return code;
        },
        breaks: true,
        gfm: true
      });
    }
  }

  /**
   * 解析Markdown为HTML
   * @param {string} markdown
   * @returns {string}
   */
  parseMarkdown(markdown) {
    if (typeof marked === 'undefined') {
      console.error('marked.js 未加载');
      return markdown;
    }

    try {
      return marked.parse(markdown);
    } catch (error) {
      console.error('Markdown解析错误:', error);
      return `<pre>${markdown}</pre>`;
    }
  }

  /**
   * 提取标题生成TOC
   * @param {string} markdown
   * @returns {Array}
   */
  extractHeadings(markdown) {
    this.headings = [];
    const lines = markdown.split('\n');
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过代码块中的内容
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        continue;
      }

      // 匹配标题
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = this.generateHeadingId(text, i);

        this.headings.push({
          level,
          text,
          id,
          line: i
        });
      }
    }

    return this.headings;
  }

  /**
   * 生成标题ID
   * @param {string} text
   * @param {number} index
   * @returns {string}
   */
  generateHeadingId(text, index) {
    // 移除特殊字符，保留中文、英文、数字
    const cleanText = text
      .replace(/[^\w一-龥]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    return `heading-${cleanText}-${index}`;
  }

  /**
   * 为HTML中的标题添加ID
   * @param {string} html
   * @returns {string}
   */
  addHeadingIds(html) {
    let index = 0;
    return html.replace(/<h([1-6])>(.*?)<\/h\1>/gi, (match, level, text) => {
      const id = this.generateHeadingId(text, index);
      index++;
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
  }

  /**
   * 获取标题列表
   * @returns {Array}
   */
  getHeadings() {
    return this.headings;
  }
}

// 导出单例
window.markdownParser = new MarkdownParser();
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/markdown-parser.js
```

Expected: 看到完整的JavaScript代码

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add markdown-parser.js
git commit -m "feat: 实现Markdown解析和TOC生成"
```

---

## Task 5: 实现UI组件

**Files:**
- Create: `chrome-md-viewer/ui-components.js`

- [ ] **Step 1: 创建ui-components.js**

```javascript
/**
 * UI组件
 * 侧边栏、TOC、文件列表等组件
 */

class UIComponents {
  constructor() {
    this.isSidebarCollapsed = false;
    this.activeTab = 'files';
    this.currentFileName = '';
  }

  /**
   * 初始化UI组件
   */
  init() {
    this.bindEvents();
    this.loadState();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 侧边栏折叠/展开
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Tab切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // 打开目录按钮
    const openDirBtn = document.getElementById('open-directory');
    if (openDirBtn) {
      openDirBtn.addEventListener('click', () => this.handleOpenDirectory());
    }
  }

  /**
   * 切换侧边栏
   */
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
      this.saveState();
    }
  }

  /**
   * 切换Tab
   * @param {string} tabName
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // 更新Tab按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // 更新Tab面板显示
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });

    this.saveState();
  }

  /**
   * 处理打开目录
   */
  async handleOpenDirectory() {
    try {
      const directoryHandle = await window.fileSystemManager.openDirectory();
      if (directoryHandle) {
        await this.loadDirectoryFiles(directoryHandle);
      }
    } catch (error) {
      console.error('打开目录失败:', error);
      this.showError('打开目录失败: ' + error.message);
    }
  }

  /**
   * 加载目录文件
   * @param {FileSystemDirectoryHandle} directoryHandle
   */
  async loadDirectoryFiles(directoryHandle) {
    try {
      const files = await window.fileSystemManager.readDirectory(directoryHandle);
      this.renderFileList(files);
    } catch (error) {
      console.error('读取目录失败:', error);
      this.showError('读取目录失败: ' + error.message);
    }
  }

  /**
   * 渲染文件列表
   * @param {Array} files
   */
  renderFileList(files) {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;

    fileList.innerHTML = '';

    if (files.length === 0) {
      fileList.innerHTML = '<p class="placeholder">目录中没有Markdown文件</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'file-tree';

    files.forEach(file => {
      const li = this.createFileListItem(file);
      ul.appendChild(li);
    });

    fileList.appendChild(ul);
  }

  /**
   * 创建文件列表项
   * @param {Object} file
   * @returns {HTMLElement}
   */
  createFileListItem(file) {
    const li = document.createElement('li');
    li.className = `file-item ${file.type}`;

    if (file.type === 'directory') {
      li.innerHTML = `
        <span class="folder-icon">📁</span>
        <span class="folder-name">${file.name}</span>
      `;

      if (file.children && file.children.length > 0) {
        const childUl = document.createElement('ul');
        childUl.className = 'file-tree-children';
        childUl.style.display = 'none';

        file.children.forEach(child => {
          const childLi = this.createFileListItem(child);
          childUl.appendChild(childLi);
        });

        li.appendChild(childUl);

        // 点击展开/折叠
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = childUl.style.display !== 'none';
          childUl.style.display = isExpanded ? 'none' : 'block';
          li.classList.toggle('expanded', !isExpanded);
        });
      }
    } else {
      li.innerHTML = `
        <span class="file-icon">📄</span>
        <span class="file-name">${file.name}</span>
      `;

      // 点击文件
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleFileClick(file);
      });
    }

    return li;
  }

  /**
   * 处理文件点击
   * @param {Object} file
   */
  async handleFileClick(file) {
    try {
      // 更新当前文件名
      this.currentFileName = file.name;
      document.getElementById('current-file-name').textContent = file.name;

      // 读取文件内容
      const content = await window.fileSystemManager.readFile(file.handle);

      // 解析Markdown
      const html = window.markdownParser.parseMarkdown(content);
      const headings = window.markdownParser.extractHeadings(content);

      // 渲染内容
      const markdownContent = document.getElementById('markdown-content');
      markdownContent.innerHTML = window.markdownParser.addHeadingIds(html);

      // 渲染TOC
      this.renderTOC(headings);

      // 高亮当前文件
      this.highlightCurrentFile(file.name);

    } catch (error) {
      console.error('读取文件失败:', error);
      this.showError('读取文件失败: ' + error.message);
    }
  }

  /**
   * 渲染TOC
   * @param {Array} headings
   */
  renderTOC(headings) {
    // 渲染左侧TOC面板
    const tocList = document.getElementById('toc-list');
    if (tocList) {
      tocList.innerHTML = '';

      if (headings.length === 0) {
        tocList.innerHTML = '<p class="placeholder">没有标题</p>';
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'toc-tree';

      headings.forEach(heading => {
        const li = document.createElement('li');
        li.className = `toc-item level-${heading.level}`;
        li.innerHTML = `<a href="#${heading.id}" data-heading-id="${heading.id}">${heading.text}</a>`;
        li.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToHeading(heading.id);
        });
        ul.appendChild(li);
      });

      tocList.appendChild(ul);
    }

    // 渲染右侧TOC侧边栏
    const tocTree = document.getElementById('toc-tree');
    if (tocTree) {
      tocTree.innerHTML = '';

      if (headings.length === 0) {
        tocTree.innerHTML = '<p class="placeholder">没有标题</p>';
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'toc-tree';

      headings.forEach(heading => {
        const li = document.createElement('li');
        li.className = `toc-item level-${heading.level}`;
        li.innerHTML = `<a href="#${heading.id}" data-heading-id="${heading.id}">${heading.text}</a>`;
        li.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToHeading(heading.id);
        });
        ul.appendChild(li);
      });

      tocTree.appendChild(ul);
    }
  }

  /**
   * 滚动到标题位置
   * @param {string} headingId
   */
  scrollToHeading(headingId) {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // 高亮标题
      this.highlightHeading(headingId);
    }
  }

  /**
   * 高亮标题
   * @param {string} headingId
   */
  highlightHeading(headingId) {
    // 移除所有高亮
    document.querySelectorAll('.toc-item').forEach(item => {
      item.classList.remove('active');
    });

    // 添加高亮
    const tocItem = document.querySelector(`.toc-item a[data-heading-id="${headingId}"]`);
    if (tocItem) {
      tocItem.parentElement.classList.add('active');
    }
  }

  /**
   * 高亮当前文件
   * @param {string} fileName
   */
  highlightCurrentFile(fileName) {
    // 移除所有高亮
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('active');
    });

    // 添加高亮
    const fileItems = document.querySelectorAll('.file-name');
    fileItems.forEach(item => {
      if (item.textContent === fileName) {
        item.parentElement.classList.add('active');
      }
    });
  }

  /**
   * 显示错误信息
   * @param {string} message
   */
  showError(message) {
    const markdownContent = document.getElementById('markdown-content');
    if (markdownContent) {
      markdownContent.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }

  /**
   * 保存状态
   */
  saveState() {
    chrome.storage.local.set({
      isSidebarCollapsed: this.isSidebarCollapsed,
      activeTab: this.activeTab
    });
  }

  /**
   * 加载状态
   */
  loadState() {
    chrome.storage.local.get(['isSidebarCollapsed', 'activeTab'], (result) => {
      if (result.isSidebarCollapsed !== undefined) {
        this.isSidebarCollapsed = result.isSidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
        }
      }

      if (result.activeTab) {
        this.switchTab(result.activeTab);
      }
    });
  }
}

// 导出单例
window.uiComponents = new UIComponents();
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/ui-components.js
```

Expected: 看到完整的JavaScript代码

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add ui-components.js
git commit -m "feat: 实现UI组件"
```

---

## Task 6: 实现主界面逻辑

**Files:**
- Create: `chrome-md-viewer/viewer.js`

- [ ] **Step 1: 创建viewer.js**

```javascript
/**
 * 主界面逻辑
 * 初始化应用，协调各组件
 */

class Viewer {
  constructor() {
    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onReady());
    } else {
      this.onReady();
    }
  }

  /**
   * DOM就绪后的初始化
   */
  onReady() {
    console.log('Markdown Viewer 初始化中...');

    // 初始化UI组件
    window.uiComponents.init();

    // 初始化滚动监听
    this.initScrollListener();

    console.log('Markdown Viewer 初始化完成');
  }

  /**
   * 初始化滚动监听
   * 用于TOC高亮跟随
   */
  initScrollListener() {
    const content = document.getElementById('markdown-content');
    if (!content) return;

    let scrollTimeout;

    content.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateTOCHighlight();
      }, 100);
    });
  }

  /**
   * 更新TOC高亮
   */
  updateTOCHighlight() {
    const content = document.getElementById('markdown-content');
    if (!content) return;

    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentHeading = null;

    // 找到当前可视区域的标题
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      if (rect.top >= contentRect.top && rect.top <= contentRect.bottom) {
        currentHeading = heading;
      }
    });

    // 更新TOC高亮
    if (currentHeading) {
      const headingId = currentHeading.id;
      window.uiComponents.highlightHeading(headingId);
    }
  }
}

// 启动应用
new Viewer();
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/viewer.js
```

Expected: 看到完整的JavaScript代码

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add viewer.js
git commit -m "feat: 实现主界面逻辑"
```

---

## Task 7: 实现CSS样式

**Files:**
- Create: `chrome-md-viewer/viewer.css`

- [ ] **Step 1: 创建viewer.css**

```css
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #24292f;
  background-color: #ffffff;
}

/* 容器布局 */
.container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  min-width: 300px;
  background-color: #f6f8fa;
  border-right: 1px solid #d0d7de;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, min-width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #d0d7de;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.toggle-btn:hover {
  background-color: #e1e4e8;
}

.sidebar-title {
  margin-left: 8px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .sidebar-title {
  display: none;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #d0d7de;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background-color: #e1e4e8;
}

.tab-btn.active {
  border-bottom-color: #0969da;
  color: #0969da;
}

.sidebar.collapsed .tab-btn {
  display: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.sidebar.collapsed .sidebar-content {
  display: none;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #d0d7de;
}

.sidebar.collapsed .sidebar-footer {
  display: none;
}

.primary-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #0969da;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-btn:hover {
  background-color: #0860ca;
}

/* 文件列表 */
.file-list {
  font-size: 14px;
}

.file-tree {
  list-style: none;
}

.file-item {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-item:hover {
  background-color: #e1e4e8;
}

.file-item.active {
  background-color: #0969da;
  color: white;
}

.file-item.directory {
  font-weight: 500;
}

.file-tree-children {
  padding-left: 16px;
}

.folder-icon,
.file-icon {
  font-size: 16px;
}

/* TOC */
.toc-list,
.toc-tree {
  font-size: 14px;
}

.toc-item {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.toc-item:hover {
  background-color: #e1e4e8;
}

.toc-item.active {
  background-color: #0969da;
  color: white;
}

.toc-item.level-1 {
  padding-left: 8px;
  font-weight: 600;
}

.toc-item.level-2 {
  padding-left: 24px;
}

.toc-item.level-3 {
  padding-left: 40px;
}

.toc-item.level-4 {
  padding-left: 56px;
}

.toc-item.level-5 {
  padding-left: 72px;
}

.toc-item.level-6 {
  padding-left: 88px;
}

.toc-item a {
  color: inherit;
  text-decoration: none;
}

.toc-item a:hover {
  text-decoration: underline;
}

/* 主内容区 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 16px 24px;
  border-bottom: 1px solid #d0d7de;
  background-color: #ffffff;
}

.content-header h1 {
  font-size: 20px;
  font-weight: 600;
}

#markdown-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 右侧TOC侧边栏 */
.toc-sidebar {
  width: 250px;
  min-width: 250px;
  background-color: #f6f8fa;
  border-left: 1px solid #d0d7de;
  display: flex;
  flex-direction: column;
}

.toc-header {
  padding: 16px;
  border-bottom: 1px solid #d0d7de;
}

.toc-header h2 {
  font-size: 16px;
  font-weight: 600;
}

#toc-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 占位符 */
.placeholder {
  color: #656d76;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 错误信息 */
.error-message {
  color: #cf222e;
  background-color: #ffebe9;
  border: 1px solid #ff8182;
  border-radius: 6px;
  padding: 16px;
  font-size: 14px;
}

/* GitHub Markdown样式覆盖 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 16px;
  word-wrap: break-word;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.3em;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body h4 {
  font-size: 1em;
}

.markdown-body h5 {
  font-size: 0.875em;
}

.markdown-body h6 {
  font-size: 0.85em;
  color: #656d76;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  color: #24292f;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  white-space: pre;
  background: transparent;
  border: 0;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body li {
  margin-top: 0.25em;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
  width: auto;
  overflow: auto;
  display: block;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

.markdown-body table th {
  font-weight: 600;
  background-color: #f6f8fa;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #ffffff;
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d0d7de;
  border: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 100%;
    height: auto;
    max-height: 300px;
  }

  .sidebar.collapsed {
    width: 100%;
    min-width: 100%;
    max-height: 60px;
  }

  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    height: auto;
    max-height: 200px;
  }

  .content {
    flex: 1;
    overflow: auto;
  }
}
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/viewer.css
```

Expected: 看到完整的CSS代码

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add viewer.css
git commit -m "feat: 实现CSS样式"
```

---

## Task 8: 创建图标文件

**Files:**
- Create: `chrome-md-viewer/icons/icon16.png`
- Create: `chrome-md-viewer/icons/icon48.png`
- Create: `chrome-md-viewer/icons/icon128.png`

- [ ] **Step 1: 创建icons目录**

```bash
mkdir -p chrome-md-viewer/icons
```

- [ ] **Step 2: 使用ImageMagick创建简单图标**

```bash
# 创建16x16图标
convert -size 16x16 xc:transparent -fill "#0969da" -draw "roundrectangle 0,0 15,15 3,3" -fill white -font Helvetica -pointsize 10 -gravity center -annotate 0 "M" chrome-md-viewer/icons/icon16.png

# 创建48x48图标
convert -size 48x48 xc:transparent -fill "#0969da" -draw "roundrectangle 0,0 47,47 8,8" -fill white -font Helvetica -pointsize 28 -gravity center -annotate 0 "M" chrome-md-viewer/icons/icon48.png

# 创建128x128图标
convert -size 128x128 xc:transparent -fill "#0969da" -draw "roundrectangle 0,0 127,127 20,20" -fill white -font Helvetica -pointsize 72 -gravity center -annotate 0 "M" chrome-md-viewer/icons/icon128.png
```

- [ ] **Step 3: 验证图标创建**

```bash
ls -la chrome-md-viewer/icons/
```

Expected: 看到三个PNG文件

- [ ] **Step 4: 提交代码**

```bash
cd chrome-md-viewer
git add icons/
git commit -m "feat: 创建图标文件"
```

---

## Task 9: 创建README文档

**Files:**
- Create: `chrome-md-viewer/README.md`

- [ ] **Step 1: 创建README.md**

```markdown
# Chrome Markdown Viewer

一个用于浏览本地Markdown文档库的Chrome浏览器插件。

## 功能特性

- 📁 浏览本地Markdown文档库
- 📝 GitHub风格Markdown渲染
- 🎨 代码语法高亮
- 📑 目录导航（TOC）
- 📱 响应式布局
- 💾 状态保存

## 安装方法

1. 下载或克隆此仓库
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-md-viewer` 目录

## 使用方法

1. 点击Chrome工具栏中的扩展图标
2. 点击"打开目录"按钮选择包含Markdown文件的文件夹
3. 在左侧文件列表中点击要查看的文件
4. 使用右侧目录导航快速跳转

## 技术栈

- Chrome Extension (Manifest V3)
- marked.js - Markdown解析
- highlight.js - 代码高亮
- GitHub Markdown CSS - 样式
- File System Access API - 文件系统访问

## 开发

### 项目结构

```
chrome-md-viewer/
├── manifest.json          # 扩展配置
├── background.js          # 后台脚本
├── viewer.html            # 主界面
├── viewer.css             # 样式
├── viewer.js              # 主逻辑
├── file-system.js         # 文件系统封装
├── markdown-parser.js     # Markdown解析
├── ui-components.js       # UI组件
├── libs/                  # 第三方库
├── icons/                 # 图标
└── README.md
```

### 本地开发

1. 克隆仓库
2. 在Chrome中加载扩展
3. 修改代码后点击扩展页面的"刷新"按钮

## 许可证

MIT License
```

- [ ] **Step 2: 验证文件创建**

```bash
cat chrome-md-viewer/README.md
```

Expected: 看到完整的README内容

- [ ] **Step 3: 提交代码**

```bash
cd chrome-md-viewer
git add README.md
git commit -m "docs: 创建README文档"
```

---

## Task 10: 测试和验证

**Files:**
- None (testing existing files)

- [ ] **Step 1: 验证所有文件存在**

```bash
ls -la chrome-md-viewer/
ls -la chrome-md-viewer/libs/
ls -la chrome-md-viewer/icons/
```

Expected: 所有文件都存在

- [ ] **Step 2: 验证manifest.json格式**

```bash
cat chrome-md-viewer/manifest.json | python -m json.tool
```

Expected: JSON格式正确，无语法错误

- [ ] **Step 3: 在Chrome中加载扩展**

1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-md-viewer` 目录

- [ ] **Step 4: 测试基本功能**

1. 点击扩展图标打开viewer
2. 点击"打开目录"按钮
3. 选择一个包含.md文件的目录
4. 点击一个.md文件查看渲染效果
5. 测试侧边栏折叠/展开
6. 测试TOC导航

- [ ] **Step 5: 最终提交**

```bash
cd chrome-md-viewer
git add .
git commit -m "feat: 完成Chrome Markdown Viewer插件开发"
```

---

## 完成

所有任务完成后，你将拥有一个功能完整的Chrome Markdown Viewer插件，可以：

1. 浏览本地Markdown文档库
2. 以GitHub风格渲染Markdown
3. 提供目录导航功能
4. 支持侧边栏折叠/展开
5. 保存用户状态

**下一步：**
- 根据测试反馈进行优化
- 添加更多功能（搜索、主题切换等）
- 发布到Chrome Web Store
