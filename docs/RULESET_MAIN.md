# Main Branch Ruleset

**Ruleset Name:** `main-branch-protection`

This ruleset enforces the pull request workflow for the `main` branch (production).

---

## Configuration

### Ruleset Name and Status

- **Ruleset Name:** `main-branch-protection`
- **Enforcement status:** **Active**

### Target Branches

- **Include by pattern:** `main`

---

## Rules

Expand **"Branch protections"** section and configure:

### ❌ Restrict creations

**Leave OFF** - Handled in the common ruleset

### ❌ Restrict deletions

**Leave OFF** - Handled in the common ruleset

### ❌ Restrict updates

**Leave OFF** - Handled in the common ruleset

### ✅ Require a pull request before merging

**Toggle ON**

**Settings:**

- **Required number of approvals before merging:** `1` (or more for production, e.g., 2)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (enforced via .github/CODEOWNERS file)
- ❌ Require approval of the most recent reviewable push

### ✅ Require status checks to pass before merging

**Toggle ON**

- ✅ **Require branches to be up to date before merging**
- **Status checks that are required:**
  - Select `check-target` (from PR Target Branch Check workflow)
  - ⚠️ This check will only appear after the workflow runs at least once
  - Optionally add: `CodeQL analysis (javascript-typescript)` (security scan)
  - Add any production deployment checks if you add a deployment workflow later

The `check-target` status check enforces that only the test branch can create PRs to main, preventing accidental direct merges from feature branches.

The `CodeQL analysis` check ensures code passes security analysis before merging to production.

### ✅ Require conversation resolution before merging

**Toggle ON**

No additional settings needed.

### ❌ Require a merge queue

**Leave OFF** (not needed for this project)

### ✅ Require deployments to succeed

**Leave OFF** (deployment happens via workflow, not GitHub Deployments API)

### ✅ Allowed merge methods

**Configure merge methods:**

- ❌ **Squash** - Disallow (not for test → main)
- ✅ **Merge commit** - Allow merge commit
- ❌ **Rebase** - Disallow

**Purpose:** Enforces merge commit for test → main to preserve version history and create clear release points.

### ❌ Require signed commits

**Leave OFF** (unless you want to enforce commit signing)

### ❌ Require linear history

**Leave OFF** - We're enforcing squash merge at the repository level instead

### ❌ Require deployments to succeed

**Leave OFF** (not applicable)

### ❌ Block force pushes

**Leave OFF** - Handled in the common ruleset (`protected-branches-common`)

---

## Bypass List

**Leave empty.**

- No one should bypass PR requirements for the main/production branch
- Not even admins or the GitHub Actions bot
- Emergency bypasses can be done through the `protected-branches-common` ruleset if absolutely necessary

---

## Purpose

This ruleset ensures:

- All changes to `main` go through pull requests (typically from `test` branch)
- PRs must be reviewed and approved (higher approval count recommended for production)
- All PR conversations must be resolved
- Only PRs from the `test` branch are allowed (enforced by `check-target` workflow)
- Production code is always reviewed before deployment

The main branch should only receive changes from the `test` branch after they've been:

1. Developed in a feature branch
2. Merged to `test` via PR with version label
3. Tested in the test environment
4. Promoted to `main` via another PR

**Note:** Protections like force push blocking, deletion blocking, and creation restrictions are handled in the `protected-branches-common` ruleset.
