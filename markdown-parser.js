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
