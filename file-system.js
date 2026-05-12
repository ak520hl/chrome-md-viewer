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
