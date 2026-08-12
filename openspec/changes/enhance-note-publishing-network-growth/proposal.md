# Change: enhance-note-publishing-network-growth

## Why

当前站点已经能导入 Markdown 和图片，但发布前缺少清晰的变更预览，文章之间缺少知识关联，且没有低侵入的读者统计和评论入口。

## What Changes

- 导入器默认先预览再发布，并输出可核对的导入摘要。
- 解析双链、反向链接、相关文章与课程系列导航。
- 支持更新时间、阅读时长、精选和变更记录。
- 可选接入 GoatCounter、Giscus 与 RSS 订阅入口。

## Impact

- Affected specs: note-import-workflow, note-discovery-and-quality, generated-note-navigation
- Affected code: scripts, VitePress theme components, generated content and tests
