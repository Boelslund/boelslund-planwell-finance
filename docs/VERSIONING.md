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

### 2. Automatic Version Bump on Test

When a PR is merged to the `test` branch:

1. The deployment workflow detects the version label from the merged PR
2. Runs `npm version <bump-type>` automatically
3. Creates a git tag (e.g., `v0.2.0`)
4. Pushes the version bump commit and tag to test
5. The version bump commit uses `[skip ci]` to prevent re-triggering the workflow
6. Deploys to test environment with the new version

**Note:** For this to work with branch protection, you must configure GitHub Actions to bypass the PR requirement. See [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md#allowing-github-actions-to-bypass-branch-protection) for setup instructions.

### 3. Deploying to Production

When deploying from test to main:

1. The version is **already set** on the test branch
2. Create a PR from `test` to `main`
3. No version bump happens (version was already bumped on test)
4. Merge the PR to deploy to production with the test version

### 4. Semantic Versioning Rules

Following [semver](https://semver.org/):

- **MAJOR** (1.0.0): Incompatible API changes
- **MINOR** (0.1.0): Add functionality in a backward compatible manner
- **PATCH** (0.0.1): Backward compatible bug fixes

### 5. Pre-1.0.0 Versions

Before reaching version 1.0.0, the project is considered in initial development:

- Breaking changes can use `version:minor`
- Major refactors can stay at 0.x.x
- Move to 1.0.0 when ready for production release

## Workflow

### Standard Development Workflow

1. Create a feature branch from `test`

   ```bash
   git checkout test
   git pull
   git checkout -b feature/my-feature
   ```

2. Make your changes and commit

3. Open a PR to `test` branch

   - **Add the appropriate version label** (`version:patch`, `version:minor`, or `version:major`)
   - Wait for PR checks to pass
   - Get review and approval
   - Merge the PR

4. **Automatic version bump**:
   - Workflow detects the version label from the merged PR
   - Bumps version automatically (e.g., 0.1.0 → 0.1.1)
   - Pushes commit with `[skip ci]` to avoid re-triggering
   - Creates git tag (e.g., `v0.1.1`)
   - Deploys to test environment

### Production Release Workflow

1. When ready to release to production, create PR from `test` to `main` via GitHub UI

   - The version is already set from the test deployment
   - No version label is needed on this PR; version labels are only required on PRs into `test`
   - Wait for PR checks to pass
   - Get review and approval

2. Merge the PR
   - No version bump occurs (already done on test)
   - Production deployment happens automatically

### Emergency Hotfix

For urgent production fixes:

1. Create hotfix branch from `main`

   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/critical-bug
   ```

2. Make the fix and commit

3. Open PR to `main` with `version:patch` label

   - Get expedited review
   - Merge to deploy (version bump happens automatically if configured)

4. After deploying to production, sync `test` with `main`:
   ```bash
   git checkout test
   git merge main
   git push
   ```

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
   - [Common protections ruleset](RULESET_COMMON.md) - Shared protections for both branches

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
