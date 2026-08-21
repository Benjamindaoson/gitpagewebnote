## ADDED Requirements

### Requirement: Public README system-map lesson
The site SHALL publish a non-draft first article titled `OpenClaw 源码陪读 01：从 README 建立系统地图` in the `openclaw` category.

#### Scenario: Reader opens the first OpenClaw lesson
- **WHEN** the generated site indexes published notes
- **THEN** the article SHALL appear in the OpenClaw sidebar, category listing, RSS feed and sitemap

### Requirement: Lesson facts are versioned and sourced
The first lesson SHALL identify the OpenClaw source baseline, state that README is a top-level orientation rather than a source design document, and cite the official README at that baseline.

#### Scenario: Reader checks the article metadata
- **WHEN** the reader views the article frontmatter and source section
- **THEN** they SHALL find the baseline commit and a link to the corresponding official README

### Requirement: Lesson introduces a serialized learning path
The first lesson SHALL belong to the `OpenClaw 源码陪读` series with order `1` and SHALL state the next learning stages from architecture orientation through runtime, session, context and memory.

#### Scenario: Reader finishes the first lesson
- **WHEN** the reader reaches the article conclusion
- **THEN** they SHALL understand that later lessons will validate architecture and runtime behavior from current source rather than infer it solely from README
