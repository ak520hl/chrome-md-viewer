# UI 优化实现计划：温暖紫调

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Chrome Markdown Viewer 界面优化为更现代活泼的温暖紫调风格，提升视觉精致度

**Architecture:** 通过修改 CSS 变量和样式规则实现视觉升级，保持现有 HTML 结构和 JavaScript 逻辑不变。采用增量式修改，每步可独立验证。

**Tech Stack:** CSS3 (Custom Properties, Transitions, Shadows), Chrome Extension

---

## 文件结构

### 修改文件
- `viewer.css` - 主要样式文件，包含所有视觉改进

### 参考文件
- `viewer.html` - HTML 结构（无需修改）
- `viewer.js` - 交互逻辑（无需修改）

---

### Task 1: 更新 CSS 变量 - 色彩系统

**Files:**
- Modify: `viewer.css:1-58`

- [ ] **Step 1: 更新强调色变量**

将 `:root` 中的强调色从蓝色改为紫色：

```css
/* 强调色 */
--color-accent: #7c3aed;
--color-accent-hover: #6d28d9;
--color-accent-subtle: #f5f3ff;
```

- [ ] **Step 2: 更新状态色（可选）**

保持状态色不变，或微调为更协调的色调：

```css
/* 状态色 */
--color-success: #059669;
--color-warning: #d97706;
--color-error: #dc2626;
```

- [ ] **Step 3: 验证颜色变化**

在 Chrome 中加载扩展，打开一个 Markdown 文件，检查：
- 按钮颜色是否为紫色
- Tab 高亮是否为紫色
- 链接颜色是否为紫色

- [ ] **Step 4: 提交**

```bash
git add viewer.css
git commit -m "style: 更新强调色为温暖紫色调"
```

---

### Task 2: 更新圆角系统

**Files:**
- Modify: `viewer.css:44-48`

- [ ] **Step 1: 更新圆角变量**

```css
/* 圆角 */
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
```

- [ ] **Step 2: 验证圆角效果**

检查以下元素的圆角：
- 按钮（主要按钮、Tab 按钮）
- 代码块
- 引用块
- 表格

- [ ] **Step 3: 提交**

```bash
git add viewer.css
git commit -m "style: 增大圆角值，营造柔和感"
```

---

### Task 3: 更新阴影系统

**Files:**
- Modify: `viewer.css:49-53`

- [ ] **Step 1: 更新阴影变量**

```css
/* 阴影 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-hover: 0 4px 12px rgba(124, 58, 237, 0.15);
```

- [ ] **Step 2: 应用 hover 阴影**

更新 `.primary-btn:hover` 样式：

```css
.primary-btn:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}
```

- [ ] **Step 3: 验证阴影效果**

检查：
- 按钮 hover 时是否有紫色调阴影
- 阴影是否柔和不突兀

- [ ] **Step 4: 提交**

```bash
git add viewer.css
git commit -m "style: 添加紫色调 hover 阴影"
```

---

### Task 4: 优化过渡动画

**Files:**
- Modify: `viewer.css:54-58`

- [ ] **Step 1: 保持过渡变量不变**

```css
/* 过渡 */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

- [ ] **Step 2: 添加文件项 hover 动画**

更新 `.file-item:hover` 样式：

```css
.file-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
  padding-left: calc(var(--space-md) + 4px);
}
```

- [ ] **Step 3: 添加 TOC 项 hover 动画**

更新 `.toc-item:hover` 样式：

```css
.toc-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-left: 2px solid var(--color-accent);
  padding-left: calc(var(--space-sm) + 2px);
}
```

- [ ] **Step 4: 验证动画效果**

检查：
- 文件项 hover 时是否轻微右移
- TOC 项 hover 时是否显示紫色左边框
- 动画是否平滑自然

- [ ] **Step 5: 提交**

```bash
git add viewer.css
git commit -m "style: 优化 hover 动画效果"
```

---

### Task 5: 优化内容区样式

**Files:**
- Modify: `viewer.css` (Markdown 内容样式部分)

- [ ] **Step 1: 优化链接样式**

更新 `.markdown-body a` 样式：

```css
.markdown-body a {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.markdown-body a:hover {
  border-bottom-color: var(--color-accent);
}
```

- [ ] **Step 2: 优化引用块样式**

更新 `.markdown-body blockquote` 样式：

```css
.markdown-body blockquote {
  padding: var(--space-md) var(--space-lg);
  border-left: 3px solid var(--color-accent);
  margin: 0 0 var(--space-md) 0;
  background-color: var(--color-accent-subtle);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 优化代码块样式**

更新 `.markdown-body pre` 样式：

```css
.markdown-body pre {
  margin-bottom: var(--space-md);
  padding: var(--space-lg);
  background-color: #1e1e1e;
  border-radius: var(--radius-md);
  overflow-x: auto;
}
```

- [ ] **Step 4: 优化表格样式**

更新 `.markdown-body table th` 样式：

```css
.markdown-body table th {
  font-weight: 600;
  background-color: var(--color-accent-subtle);
  color: var(--color-text-primary);
}
```

- [ ] **Step 5: 验证内容样式**

检查：
- 链接是否为紫色且有 hover 效果
- 引用块是否有紫色左边框
- 代码块圆角是否为 12px
- 表头是否有浅紫色背景

- [ ] **Step 6: 提交**

```bash
git add viewer.css
git commit -m "style: 优化 Markdown 内容区样式"
```

---

### Task 6: 优化侧边栏样式

**Files:**
- Modify: `viewer.css` (侧边栏部分)

- [ ] **Step 1: 优化 Tab 按钮样式**

更新 `.tab-btn.active` 样式：

```css
.tab-btn.active {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
}
```

- [ ] **Step 2: 优化文件项活跃状态**

更新 `.file-item.active` 样式：

```css
.file-item.active {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
}
```

- [ ] **Step 3: 优化 TOC 项活跃状态**

更新 `.toc-item.active` 样式：

```css
.toc-item.active {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  border-left: 2px solid var(--color-accent);
}
```

- [ ] **Step 4: 验证侧边栏样式**

检查：
- 活跃 Tab 是否为紫色高亮
- 活跃文件项是否为紫色高亮
- 活跃 TOC 项是否有紫色左边框

- [ ] **Step 5: 提交**

```bash
git add viewer.css
git commit -m "style: 优化侧边栏活跃状态样式"
```

---

### Task 7: 最终验证与调整

**Files:**
- Modify: `viewer.css` (如有需要)

- [ ] **Step 1: 完整功能测试**

在 Chrome 中加载扩展，测试以下场景：
1. 打开目录，选择文件夹
2. 点击文件列表中的文件
3. 切换 Tab（文件/目录）
4. 折叠/展开侧边栏
5. 点击 TOC 项跳转
6. 滚动内容区，观察 TOC 高亮
7. 检查响应式布局（调整窗口大小）

- [ ] **Step 2: 视觉一致性检查**

检查以下元素是否风格统一：
- 所有按钮的圆角和阴影
- 所有活跃状态的紫色高亮
- 所有 hover 效果的动画
- 字体层级是否清晰

- [ ] **Step 3: 修复发现的问题**

如有视觉不一致或功能异常，立即修复并提交。

- [ ] **Step 4: 最终提交**

```bash
git add viewer.css
git commit -m "style: 完成温暖紫调 UI 优化"
```

---

## 验证清单

- [ ] 紫色强调色贯穿整个界面
- [ ] 圆角统一为 12px / 8px
- [ ] 阴影柔和且有紫色调
- [ ] 过渡动画平滑自然
- [ ] hover 效果明显但不突兀
- [ ] 字体层级清晰
- [ ] 响应式布局正常
- [ ] 所有功能正常工作
