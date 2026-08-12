## ADDED Requirements

### Requirement: Import preview and staged publishing

The interactive importer SHALL show the administrator the target Markdown path, selected category/tags, copied-image count, and all new or modified files after a validated import. It SHALL offer local preview before any Git action and SHALL only commit or push after an explicit subsequent choice.

#### Scenario: Administrator previews an imported note before publishing

- **WHEN** an administrator imports a valid Markdown file and selects local preview
- **THEN** the importer writes the note and assets, prints the import summary, starts the local preview command, and performs no Git commit or push

#### Scenario: Administrator exits without publishing

- **WHEN** an administrator declines a later commit or push choice
- **THEN** imported files remain in the local worktree and no Git action is performed
