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

1. 点击Chrome工具栏中的扩展图标（会打开一个小窗口）
2. 在弹出窗口中点击"打开目录"按钮
3. 选择包含Markdown文件的文件夹
4. 在左侧文件列表中点击要查看的文件
5. 使用右侧目录导航快速跳转

**注意：** 不要直接在Chrome中打开.md文件，需要通过扩展图标访问。

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
