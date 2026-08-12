## ADDED Requirements

### Requirement: 交互式本地笔记导入

系统 SHALL 提供本地命令 `npm run note:import -- <markdown-path>`，用于导入一个 Markdown 文件。该命令 SHALL 使用编号选择题收集栏目、标签、难度、发布日期和发布方式；只有标题和摘要允许自由文本输入。

#### Scenario: 管理员导入笔记但不发布

- **WHEN** 管理员选择“仅导入”
- **THEN** 系统将经校验的笔记和资源写入工作区但不执行 Git 提交或推送

#### Scenario: 管理员导入并推送笔记

- **WHEN** 管理员选择“导入、提交并推送”且内容校验通过
- **THEN** 系统创建 Git 提交并推送当前分支，使 GitHub Pages 工作流能够发布内容

### Requirement: Markdown 图片导入

系统 SHALL 识别 Markdown 中相对引用的本地图片，将其复制至 `site/public/notes/<slug>/`，并将文章中的图片地址重写为 GitHub Pages 项目基础路径下的公开地址。

#### Scenario: Markdown 引用同目录图片

- **WHEN** 源 Markdown 使用相对路径引用合法图片
- **THEN** 系统复制图片并在导入文章中写入对应的 `/gitpagewebnote/notes/<slug>/` 地址

#### Scenario: Markdown 引用目录外资源

- **WHEN** 源 Markdown 图片路径解析到源文件目录之外
- **THEN** 系统拒绝导入并明确报告不安全图片路径

### Requirement: 导入冲突保护

系统 SHALL 在目标文章或资源文件已存在时拒绝覆盖，并说明发生冲突的目标路径。

#### Scenario: 导入相同 slug

- **WHEN** 目标栏目中已存在相同 slug 的 Markdown 文件
- **THEN** 系统不修改已有文件并提示管理员选择其他标题或 slug
