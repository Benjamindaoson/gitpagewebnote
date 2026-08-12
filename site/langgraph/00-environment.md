# 00. 环境配置

> 从零开始，为 LangGraph 学习和实验准备一个隔离、可复现的 Python 环境。

## 1. 安装 Python

建议使用 Python 3.11 或更高版本。Windows 用户可以从 [Python 官网](https://www.python.org/downloads/) 下载稳定版本。

### 1.1 验证安装

在终端执行：

```bash
python --version
```

看到 Python 版本号，说明解释器已可用。

## 2. 创建虚拟环境

不要把项目依赖直接装进全局 Python。每个项目单独创建 `.venv`：

```bash
python -m venv .venv
```

### 2.1 激活环境

Windows PowerShell：

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux：

```bash
source .venv/bin/activate
```

## 3. 安装 LangGraph

激活环境后安装核心包：

```bash
pip install -U langgraph langchain
```

### 3.1 验证依赖

```python
import langgraph

print('LangGraph 已安装')
```

## 4. 下一步

环境准备好后，继续阅读 [01 · 基础入门](/langgraph/01-introduction)。
