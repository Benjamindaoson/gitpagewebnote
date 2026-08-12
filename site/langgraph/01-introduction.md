---
title: 01 · LangGraph 基础入门
category: langgraph
tags: [LangGraph, Agent, 状态图]
date: 2026-08-12
description: 理解 LangGraph 的 State、Node 和 Edge 三个基础概念。
difficulty: beginner
---

# 01. LangGraph 基础入门

LangGraph 适合把多步骤 AI 工作流表达为可控的状态图。

## 核心概念

### State

State 是节点之间传递的数据结构，描述当前工作流的上下文。

### Node

Node 是执行一个明确职责的函数，例如检索信息、调用模型或整理输出。

### Edge

Edge 决定节点的执行顺序；条件边可以根据 State 选择下一步。

## 学习建议

先画出状态与节点职责，再编写代码。状态图清晰后，调试和扩展都会容易得多。
