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
