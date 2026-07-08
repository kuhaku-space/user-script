# Commit message rules

- Language: English.
- Format: [Conventional Commits](https://www.conventionalcommits.org/) — `<type>(<scope>): <subject>`.
  - `type`: `feat`, `fix`, `docs`, `chore`, `refactor`, `style`, `test`, `perf`, `build`, `ci`.
  - `scope`: the userscript file's base name (e.g. `icpcsec-dark-theme`).
  - `subject`: imperative mood, no trailing period.
- Body: one line, only when the change isn't self-explanatory from the subject — state the reason briefly.

Examples:

```
feat(icpcsec-dark-theme): add dark theme fix for standings page
fix(icpcsec-dark-theme): correct rating color contrast on dark green band
chore(icpcsec-dark-theme): bump version to 2.5.0
```
