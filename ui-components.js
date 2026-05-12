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
