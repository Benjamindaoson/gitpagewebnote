## ADDED Requirements

### Requirement: Knowledge and engagement views

The generated VitePress site SHALL render article reading metadata, change logs, wiki links, backlinks, related notes, and adjacent series notes. It SHALL provide a course-path discovery page and optional GoatCounter/Giscus integrations driven only by public configuration.

#### Scenario: Engagement configuration is disabled

- **WHEN** all engagement configuration values are empty
- **THEN** the built site loads no GoatCounter or Giscus script and continues to render every public article

#### Scenario: A configured article receives reader features

- **WHEN** valid public GoatCounter and Giscus identifiers are configured
- **THEN** the site loads GoatCounter globally and renders a Giscus comment section on public note pages
