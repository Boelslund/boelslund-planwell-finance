# Test Branch Ruleset

**Ruleset Name:** `test-branch-protection`

This ruleset enforces the pull request workflow and status checks for the `test` branch.

---

## Configuration

### Ruleset Name and Status

- **Ruleset Name:** `test-branch-protection`
- **Enforcement status:** **Active**

### Target Branches

- **Include by pattern:** `test`

> **Note:** "Ref" means reference (branch or tag name in Git). The pattern `test` will match the branch named `test`.

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

- **Required number of approvals before merging:** `1`
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (enforced via .github/CODEOWNERS file)
- ❌ Require approval of the most recent reviewable push

### ✅ Require status checks to pass before merging

**Toggle ON**

**Settings:**

- ✅ **Require branches to be up to date before merging**
- **Status checks that are required:**
  - Click **Add checks**
  - Type: `test` (this is the job name from deploy-test.yml workflow)
  - Press Enter to add it
  - Optionally add: `CodeQL` (security scan from default setup)

> **Note:** Status checks only appear in the dropdown after workflows run at least once. The CodeQL check name may vary depending on GitHub's default setup configuration.

### ✅ Require conversation resolution before merging

**Toggle ON**

No additional settings needed.

### ❌ Require a merge queue

**Leave OFF** (not needed for this project)

### ✅ Require deployments to succeed

**Leave OFF** (deployment happens via workflow, not GitHub Deployments API)

### ✅ Allowed merge methods

**Configure merge methods:**

- ✅ **Squash** - Allow squash merge
- ❌ **Merge commit** - Disallow (not for feature → test)
- ❌ **Rebase** - Disallow

**Purpose:** Enforces squash merge for feature → test to keep test branch history clean.

### ❌ Require signed commits

**Leave OFF** (unless you want to enforce commit signing)

### ❌ Require linear history

**Leave OFF** - We're enforcing squash merge at the repository level instead

### ❌ Block force pushes

**Leave OFF** - Handled in the common ruleset (`protected-branches-common`)

---

## Bypass List

**Leave empty.**

- This ensures PR requirements and status checks are enforced even for admins
- Emergency bypasses can be done through the `protected-branches-common` ruleset if needed

---

## Purpose

This ruleset ensures:

- All changes to `test` go through pull requests
- PRs must be reviewed and approved
- PRs must pass the test workflow
- All PR conversations must be resolved
- Only PRs from feature branches are allowed (enforced by automated checks)

The GitHub Actions bot can still push version bumps directly because:

- "Restrict updates" is not enabled in any ruleset
- The "Require PR" rule doesn't apply to automated workflow pushes

**Note:** Protections like force push blocking, deletion blocking, and creation restrictions are handled in the `protected-branches-common` ruleset.
