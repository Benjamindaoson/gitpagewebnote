## ADDED Requirements

### Requirement: Knowledge-network metadata and validation

The content system SHALL resolve wiki-style title links, build reciprocal backlinks, calculate related public notes, and construct ordered public learning series. It SHALL reject unresolved or ambiguous wiki links, links to drafts, and duplicate ordering values within a series.

#### Scenario: Published notes use a valid wiki link

- **WHEN** a public note contains `[[A public note]]`
- **THEN** generated data includes the target URL and the target includes the source as a backlink

#### Scenario: A wiki link targets a draft

- **WHEN** a public note links to a draft note by title
- **THEN** content validation fails with a diagnostic identifying the source file and draft target

### Requirement: Operational article metadata

The content system SHALL support optional updated date, featured status, change log, series name, and series order. It SHALL calculate reading minutes and exclude drafts from all generated discovery data.

#### Scenario: A featured article is updated

- **WHEN** a public article has `featured: true` and an `updated` date
- **THEN** generated data marks it featured and sorts it by its update date
