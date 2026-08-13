# 个人品牌主站与笔记站架构建议

研究日期：2026-08-13

## 结论

建立一个唯一的个人品牌主站，并将现有的 VitePress 笔记站作为其“知识库”栏目入口；暂时不要将两个站点物理合并或把笔记嵌入主站。

主站回答“我是谁、能解决什么问题、有哪些可信证据”；笔记站回答“我如何持续学习和解释问题”。两者应统一名称、视觉语言和双向导航，但继续使用独立仓库、独立构建与独立发布。

## 公开仓库审计

| 仓库 | 判断 | 处理建议 |
| --- | --- | --- |
| [daoson_website](https://github.com/Benjamindaoson/daoson_website) | 最成熟的个人站底座。已含首页、About、Projects、Now、Uses、外部发布、笔记、TIL、RSS、搜索、SEO 与内容数据模型。 | 作为唯一主站继续收敛。 |
| [gitpagewebnote](https://github.com/Benjamindaoson/gitpagewebnote) | 已部署的 VitePress 中文知识库，支持规范化 Markdown 和图片导入、分类、标签、RSS、Sitemap。 | 保持独立，在主站使用“知识库”入口链接。 |
| [TIAI_website](https://github.com/Benjamindaoson/TIAI_website) | Next.js 双语机构站。 | 仅复用双语、联系转化和 SEO 思路。 |
| [Benjamindaoson_website](https://github.com/Benjamindaoson/Benjamindaoson_website) 与 [benjamindaoson.github.io](https://github.com/Benjamindaoson/benjamindaoson.github.io) | 较早 Jekyll 站点，定位和内容高度重叠。 | 历史归档；不要继续分散维护。 |

现有根站页面含有研究论文、机构与演讲等强声明。除非每一项都能给出真实链接或公开证据，否则不应用作求职主站内容；主站应优先展示可运行项目、源码、设计取舍和真实边界。

## 建议的主站信息架构

```text
首页
├─ Projects：3–4 个深度案例（不是仓库列表）
├─ Writing：复盘、方法论、技术判断
├─ Knowledge：跳转到 gitpagewebnote
├─ Now：正在构建与研究的方向
├─ About：能力主线、协作方式、个人介绍
├─ Elsewhere：真实公众号、视频、社媒链接
└─ Contact：GitHub、邮箱、简历
```

首页应使用“作品证据”而非技能词云：一句定位、三个代表项目、最新一篇文章、知识库入口与明确联系路径。

推荐定位草案：

> 我构建更可靠、可验证、可控的 AI Agent 系统。重点关注工具边界、工作流编排、检索与证据、人工确认、评估与恢复。

## 首批代表项目

1. [SmartOrderingAgent](https://github.com/Benjamindaoson/SmartOrderingAgent)：受控工具调用、确认令牌、后端校验和事务边界。
2. [Financial_Asset_QA_System](https://github.com/Benjamindaoson/Financial_Asset_QA_System)：面向高准确性场景的确定性多阶段编排、外部数据、校验与溯源。
3. [AIEduRAG](https://github.com/Benjamindaoson/AIEduRAG)：将课程、代码、问题与评估连接起来的学习场景项目。
4. [ai-agent-engineering-lab](https://github.com/Benjamindaoson/ai-agent-engineering-lab)：19 个可运行 Agent 工程案例和学习闭环。

[SalesBoost](https://github.com/Benjamindaoson/SalesBoost) 与 [Agentic_Content_Optimizer](https://github.com/Benjamindaoson/Agentic_Content_Optimizer) 可以在补足可复现实验、可演示结果和明确项目边界后加入。避免使用无法验证的“生产级”“业界首个”或效果百分比作为个人品牌核心证据。

## 内容卡片统一模板

每个项目案例页应固定回答：问题和用户是谁、本人负责什么、架构图、关键取舍、如何验证、当前状态/边界、源码与演示链接。每篇笔记可从案例页反向链接，说明它沉淀的是哪一个工程决策。

## 分阶段执行

1. 在 `daoson_website` 中统一个人定位，删除或隐藏不能验证的陈述，添加 Knowledge 导航链接到现有笔记站。
2. 用首批 3 个项目重写 Projects 为案例页；每页至少有架构、取舍、证据和边界。
3. 在笔记站首页增加“关于作者 / 返回主站”和“项目案例”入口，实现双向导流。
4. 内容与访问稳定后，再决定使用自定义域名下的 `notes.` 子域名或 `/notes/` 路径；这不是当前合并的前置条件。

## 参考

- [daoson_website README](https://github.com/Benjamindaoson/daoson_website)
- [gitpagewebnote README](https://github.com/Benjamindaoson/gitpagewebnote)
- [SalesBoost README](https://github.com/Benjamindaoson/SalesBoost)
- [Financial Asset QA System README](https://github.com/Benjamindaoson/Financial_Asset_QA_System)
- [AI Agent Engineering Lab README](https://github.com/Benjamindaoson/ai-agent-engineering-lab)
