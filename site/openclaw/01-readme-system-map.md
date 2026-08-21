---
title: OpenClaw 源码陪读 01：从 README 建立系统地图
category: openclaw
tags: [OpenClaw, Agent, 源码阅读]
date: 2026-08-22
updated: 2026-08-22
description: 从官方 README 建立 OpenClaw 的产品边界、Gateway 中心架构与源码学习路线。
difficulty: beginner
draft: false
series: OpenClaw 源码陪读
seriesOrder: 1
appliesTo: OpenClaw main @ d17bbfc31a8fdc2e25cbf8f36c320656926dc70d
sources:
  - title: OpenClaw README（d17bbfc）
    url: https://github.com/openclaw/openclaw/blob/d17bbfc31a8fdc2e25cbf8f36c320656926dc70d/README.md
    verified: 2026-08-22
---

# OpenClaw 源码陪读 01：从 README 建立系统地图

读 OpenClaw 的 README，第一件事不是记安装命令，而是确定：这个仓库究竟在构建什么系统。

README 不是源码设计文档；它不能替代后续的调用链和实现分析。但它已经清楚划出了产品定位、顶层组件、扩展边界、安全默认值和开发入口。这些边界不先建立，直接进入 `src/` 很容易迷路。

## 1. OpenClaw 是个人 AI Runtime，不是单个聊天机器人

README 将 OpenClaw 定义为运行在用户自己设备上的个人 AI 助手，面向单一操作者。它把模型、工具、消息渠道和可选的 Companion Apps 通过一个 Gateway 连接起来。

因此，更准确的心智模型是：

```text
Personal AI Runtime
  + Agent Runtime
  + Device Runtime
  + Messaging Runtime
```

它当然包含 LLM 和 Tool Calling，但系统目标不止“让模型调用一个工具”，而是让一个本地助手跨多个聊天入口和设备能力持续工作。

## 2. Gateway 是系统中心，不是 UI

README 把 Gateway 描述为本地控制平面，管理 Sessions、Tools、Events 和 Channel Connections。Control UI、CLI 与 TUI 都是连接 Gateway 的客户端。

```text
Telegram / Discord / WhatsApp ┐
Control UI / CLI / TUI        ├→ Gateway → Agent Runtime
                               └→ Sessions / Tools / Events
```

这里的“控制平面”可以先理解为总调度中心：它不负责替模型思考，却负责把消息送入系统、维护对话状态、管理工具和把结果送回正确入口。后面阅读源码时，应从 Gateway 与 Agent Runtime 的边界理解系统，而不是从网页界面倒推全部实现。

## 3. Channel 和 Node 解决的是两类问题

Channel 决定**人从哪里与 Agent 对话**：WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage 等都属于这一层。

Companion Apps 与 Nodes 决定**Agent 可以使用哪些设备能力**：语音、Canvas、相机、屏幕和设备本地动作都在这一侧。

```text
Channel / Chat App  = 消息入口与出口
Node / Companion    = 设备能力入口与出口
```

这使 OpenClaw 不只是一个文本对话框；设备与 Computer Use 是它的正式架构面，而不是后加的演示功能。

## 4. 模型重要，但不是唯一中心

OpenClaw 可连接云端或本地模型提供方。模型负责推理；Tools 负责执行具体动作；Skills 为模型提供完成一类任务的操作说明；Plugins 则是扩展系统能力的正式封装方式。

```text
             OpenClaw Runtime
        ┌────────┼─────────┐
        ↓        ↓         ↓
      Model    Tools   Skills / Plugins
```

它们不是简单的上下级关系：Skill 更接近给 Agent 的工作说明，Plugin 更接近可安装的扩展单元。以后为 EvoClaw 设计功能时，应先问“能否用 Plugin SDK 做成插件”，而不是默认修改 Core Runtime。README 明确指出，新能力通常应以 Plugin SDK 构建并通过 ClawHub 分享。

## 5. 安全默认值直接影响运行方式

README 要求把所有入站消息当作不可信输入。支持私信的渠道会对陌生发送者执行 pairing；更关键的是，主 Session 的工具默认在宿主机执行，只有显式配置后才进入 sandbox。

这意味着下面两个说法都不对：

- “聊天渠道连接上就等于可信。”
- “工具默认都在 Docker 里隔离执行。”

后续读 Tool、Policy、Approval 与 Sandbox 时，要把它们分别看成：有哪些工具、是否允许调用、是否需要人为同意、以及最终在哪里执行。

## 6. 第一次启动已经暴露了三个关键概念

README 给出的路径是：

```text
install
  → onboard
  → 验证 Model Access
  → 创建 Workspace
  → 配置 Gateway
  → gateway status
  → dashboard
```

所以后续必须弄懂的不是“怎样启动一个 Node 服务”，而是 Workspace、Gateway、Model Access/Auth 如何共同形成一个可运行的助手环境。

仓库本身是 pnpm workspace monorepo，根目录不能用普通 `npm install` 替代官方 pnpm 开发路径。这个约束会影响后续安装依赖、构建与调试源码的方式。

## 7. 现在应留下的系统地图

```text
                         User
                           │
             ┌─────────────┼──────────────┐
             ↓             ↓              ↓
         Channel       Control UI        CLI/TUI
             └─────────────┬──────────────┘
                           ↓
                        Gateway
                           ↓
          Sessions / Events / Agent Runtime
                    ┌──────┼──────┐
                    ↓      ↓      ↓
                  Model  Tools  Skills / Plugins
                           ↓
                    Host or Sandbox
                           ↓
                   Companion Nodes
```

## 下一步：从顶层地图到真实连接

README 告诉我们系统中有哪些东西，但不解释它们如何在一次请求中协作。下一篇将先阅读当前官方 Architecture 文档，再回到固定版本的源码，确认 Gateway、不同入站路径和 Agent Runtime 的实际边界。

后续系列路线是：

```text
02 Architecture：组件如何连接
03 Runtime：一条消息如何进入 Agent turn
04 Session：状态、Transcript 与并发
05 Context：Prompt、历史、压缩与注入
06 Memory：检索、读取、写入与持久化
```

这里的每一篇都会标明当时的源码基线与来源；README 只负责建立方向，结论必须继续由当前源码验证。
