## ADDED Requirements

### Requirement: Content health reporting
The project SHALL provide a non-blocking health report that includes public, draft, and future-scheduled content risks.

#### Scenario: Editor runs a health report
- **WHEN** the editor runs `npm run content:report`
- **THEN** the report lists scheduled, stale, source-less, isolated, oversized-image, and broken-local-link findings.

### Requirement: Browser-local learning workspace
The site SHALL let readers manage completion and saved-for-later state without an account.

#### Scenario: Reader views their learning page
- **WHEN** a reader visits `/my-learning/`
- **THEN** they can filter saved/completed notes and see completion percentages for each series.

### Requirement: Operations continuity
The project SHALL offer a versioned source backup command and publish history.

#### Scenario: Administrator creates a backup
- **WHEN** the administrator runs `npm run content:backup`
- **THEN** a Git bundle containing all repository refs is created in the ignored `backups/` directory.
