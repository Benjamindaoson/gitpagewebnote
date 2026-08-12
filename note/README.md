# 笔记收件箱

1. 将 Markdown 文件及其图片文件夹拖入 `note/inbox/`。
2. 双击项目根目录的 `导入笔记.cmd`。
3. 系统会自动识别栏目、标签和难度，导入为草稿，原文件不会移动或删除。
4. 在网站本地预览确认后，再将 `draft: true` 改为 `false` 并推送发布。

如需自动直接公开导入，在项目根目录运行：

```powershell
npm run note:inbox -- --publish
```
