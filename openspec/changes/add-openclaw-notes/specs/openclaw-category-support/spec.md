## ADDED Requirements

### Requirement: OpenClaw is a supported note category
The site SHALL accept `openclaw` as a valid public note category and label it `OpenClaw` in generated category surfaces.

#### Scenario: Published OpenClaw note is indexed
- **WHEN** a non-draft Markdown note has `category: openclaw`
- **THEN** content validation SHALL accept the category and generated category data SHALL include the note under `OpenClaw`

### Requirement: OpenClaw category is reachable from site navigation
The site SHALL expose an `OpenClaw` top-level navigation link to `/openclaw/` and generate an OpenClaw sidebar from published notes.

#### Scenario: Reader opens site navigation
- **WHEN** the VitePress configuration is loaded
- **THEN** its navigation SHALL contain an `OpenClaw` item and its sidebar SHALL contain an `/openclaw/` section

### Requirement: OpenClaw notes are recognized by import workflows
The interactive and inbox import workflows SHALL recognize OpenClaw content and assign the `openclaw` category with an `OpenClaw` fallback tag.

#### Scenario: Inbox imports an OpenClaw note
- **WHEN** an inbox note is classified with the `openclaw` category and has no tags
- **THEN** the imported note SHALL receive the `OpenClaw` tag
