# Version Management

This project uses automated semantic versioning based on PR labels.

## How It Works

### 1. PR Label Requirement

When creating a PR to the `test` branch, you **must** add one of these labels:

- `version:patch` - Bug fixes and minor changes (0.1.0 → 0.1.1)
- `version:minor` - New features, backward compatible (0.1.0 → 0.2.0)
- `version:major` - Breaking changes (0.1.0 → 1.0.0)

**The PR cannot be merged without one of these labels.** The `check-version-label` workflow will fail if:

- No version label is present
- Multiple version labels are present

### 2. Automatic Version Bump

When a PR is merged to the `test` branch:

1. The deployment workflow reads the version label from the merged PR
2. Runs `npm version <bump-type>` automatically
3. Creates a git tag
4. Pushes the version bump and tag back to the repository
5. Proceeds with build and deployment

### 3. Semantic Versioning Rules

Following [semver](https://semver.org/):

- **MAJOR** (1.0.0): Incompatible API changes
- **MINOR** (0.1.0): Add functionality in a backward compatible manner
- **PATCH** (0.0.1): Backward compatible bug fixes

### 4. Pre-1.0.0 Versions

Before reaching version 1.0.0, the project is considered in initial development:

- Breaking changes can use `version:minor`
- Major refactors can stay at 0.x.x
- Move to 1.0.0 when ready for production release

## Workflow

### Recommended: Via Pull Request (Preferred)

1. Create a feature branch
2. Make your changes
3. Open a PR to `test` branch
4. **Add the appropriate version label** (`version:patch`, `version:minor`, or `version:major`)
5. Wait for PR checks to pass
6. Merge the PR
7. The version will be automatically bumped and deployed

### Alternative: Direct Commits

If you push directly to the `test` branch (not recommended):

- The version will automatically bump as a **patch** version
- A warning will be logged in the workflow
- This should only be used for emergency hotfixes or when absolutely necessary
- You lose the ability to specify major or minor version bumps

**Best Practice:** Always use PRs with version labels for proper semantic versioning control.

## Labels Setup

Make sure these labels exist in your GitHub repository:

- `version:patch` (color: `#0e8a16`)
- `version:minor` (color: `#fbca04`)
- `version:major` (color: `#d93f0b`)

You can create them manually or run:

```bash
gh label create "version:patch" --color "0e8a16" --description "Bug fixes and minor changes"
gh label create "version:minor" --color "fbca04" --description "New features, backward compatible"
gh label create "version:major" --color "d93f0b" --description "Breaking changes"
```

## Branch Protection Configuration

Branch protection ensures that changes to `test` and `main` branches follow proper review and testing processes.

**📚 See [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md) for complete setup instructions.**

### Quick Summary

**⚠️ Requirements:**

- Branch protection only works on **public repositories** (free) or **private repositories with GitHub Pro/Team/Enterprise**
- Private repos on free accounts cannot enforce branch protection

**What you get:**

- All changes to `test` and `main` require pull requests
- PRs must be reviewed and approved
- PRs must pass automated tests (status checks)
- Prevents accidental direct pushes or deletions
- Allows GitHub Actions to push automated version bumps

**Setup steps:**

1. Make repository public (or upgrade to Pro) if needed
2. Configure merge settings (allow both squash and regular merge)
3. Create three rulesets:
   - [Test branch ruleset](RULESET_TEST.md) - PR workflow for test
   - [Main branch ruleset](RULESET_MAIN.md) - PR workflow for main
   - [Basic protections ruleset](RULESET_BASIC.md) - Create/delete restrictions

See the linked documentation for detailed configuration steps.

## Version History

Version history is tracked through git tags. View all versions:

```bash
git tag -l
```

View changes in a specific version:

```bash
git show v0.2.0
```
