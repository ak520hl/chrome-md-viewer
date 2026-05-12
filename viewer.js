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
