# Branch Protection Setup

This document describes how to set up branch protection using GitHub Rulesets for the test and main branches.

## Prerequisites

**⚠️ IMPORTANT:** Branch protection (both classic rules and rulesets) is **NOT enforced on private repositories** with free personal GitHub accounts.

**You need one of:**

- Public repository (free)
- GitHub Pro ($4/month)
- GitHub Team or Enterprise organization

If you have a private repository on a free account, see [VERSIONING.md](../VERSIONING.md) for options.

---

## Overview

This project uses **3 separate rulesets** for better control:

1. **test-branch-protection** - PR requirements and status checks for test branch
2. **main-branch-protection** - PR requirements and status checks for main branch
3. **protected-branches-common** - Shared protections (create/delete/force push) for both branches

**Why separate rulesets?**

- Branch-specific rules (PR requirements, status checks) are separate and clearly defined
- Shared rules (create/delete/force push) are in one place to avoid duplication
- Common ruleset allows admin bypass for emergencies while preserving strict PR enforcement
- Better separation of concerns and easier to maintain

---

## Setup Steps

### Step 1: Change Default Branch to test

**Why:** Making `test` the default branch:

- New PRs automatically target `test` (where most PRs should go)
- Makes it harder to accidentally create PRs to `main`
- New clones start on the active development branch
- Aligns with the workflow where `test` is the primary integration branch

**Steps:**

1. Go to **Settings** → **General**
2. Under **"Default branch"** section, click the switch/pencil icon
3. Select `test` from the dropdown
4. Click **"Update"** and confirm the warning

### Step 2: Enable Security Features

GitHub provides several free security features for public repositories.

**Steps:**

1. Go to **Settings** → **Code security and analysis**
2. Enable the following:
   - ✅ **Dependency graph** (should already be enabled)
   - ✅ **Dependabot alerts** (get notified of vulnerabilities)
   - ✅ **Dependabot security updates** (auto-opens PRs for security fixes)
   - ✅ **Secret scanning** (detects accidentally committed secrets)
   - ✅ **Push protection** (blocks commits containing secrets)
   - ✅ **Code scanning** → Click "Set up" → Select **"Default"** (enables managed CodeQL)

**What each does:**

- **Dependabot**: Scans dependencies for known vulnerabilities, opens PRs to fix them
- **Secret scanning**: Detects API keys, tokens, passwords in commits
- **Push protection**: Prevents commits with secrets from being pushed
- **CodeQL (Default)**: Analyzes code for security vulnerabilities, managed by GitHub

**Configuration:**

The repository includes:

- [.github/dependabot.yml](.github/dependabot.yml) - Dependency update configuration

CodeQL uses GitHub's default setup (no workflow file needed) and runs automatically on pushes and PRs.

- Weekly dependency update checks (Mondays at 9am)
- Automatic version labels (`version:patch`)
- Groups minor/patch updates to reduce PR noise
- Automatic version labels
- Groups minor/patch updates to reduce PR noise

### Step 3: Configure Repository Merge Settings

1. Go to **Settings** → **General**
2. Scroll down to **"Pull Requests"** section
3. Configure merge options:
   - ✅ **Allow squash merging** ← Keep checked
   - ✅ **Allow merge commits** ← Keep checked
   - ❌ **Allow rebase merging** ← Uncheck
4. In the same section, enable automatic branch cleanup:
   - ✅ **Automatically delete head branches** ← Check this

These settings save automatically.

**Merge Strategy:**

- **feature → test:** Use **Squash and merge** to keep test history clean
- **test → main:** Use **Create a merge commit** to preserve version history and have clear release points

You'll choose the merge type when merging each PR.

**Branch Cleanup:**

- Feature branches are automatically deleted after merging to test
- Keeps the repository clean and prevents stale branches
- **Protected branches (test, main) are NOT deleted** due to the "Restrict deletions" rule in your rulesets
- Only non-protected feature branches get auto-deleted
- You can still restore deleted branches if needed (within 30 days)

### Step 4: Create the Three Rulesets

Follow these guides in order:

1. [Test Branch Ruleset](RULESET_TEST.md) - PR requirements and status checks for test
2. [Main Branch Ruleset](RULESET_MAIN.md) - PR requirements for main (production)
3. [Common Branch Protections Ruleset](RULESET_COMMON.md) - Shared protections for both branches

---

## Automated Branch Protection

The repository includes a **PR Target Branch Check** workflow (`.github/workflows/pr-target-check.yml`) that:

- ❌ **Blocks** PRs from feature branches directly to main
- ❌ **Blocks** PRs from main to test (wrong direction)
- ✅ **Allows** PRs from feature branches to test
- ✅ **Allows** PRs from test to main

This workflow is set as a required status check in the main branch ruleset, creating an automated guardrail that prevents developers from accidentally bypassing the feature → test → main workflow.

---

## Admin Bypass Capability

The **`protected-branches-common`** ruleset includes admin bypass in **"Pull request only"** mode:

**What admins CAN bypass:**

- ✅ Creation restrictions (recreating a deleted branch)
- ✅ Deletion restrictions (deleting test or main in an emergency)
- ✅ Force push blocking (rewriting history if absolutely necessary)

**What admins CANNOT bypass:**

- ❌ PR requirements (must still create PRs, not direct push)
- ❌ Status checks (tests must still pass)
- ❌ Required approvals (still need reviews)
- ❌ Conversation resolution requirements

**When to use admin bypass:**

- Emergency hotfixes that require recreating a branch
- Recovering from critical repository mistakes
- Repository maintenance tasks
- **NOT for normal development - always use the PR workflow**

The test and main rulesets have **no bypass** configured, ensuring PR requirements are always enforced for everyone, including admins.

---

## Allowing GitHub Actions to Bypass Branch Protection

For automated version bumping to work, GitHub Actions needs permission to push directly to the `test` branch.

### Configure Deploy Keys Bypass

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click on **test-branch-protection** ruleset
3. Scroll down to **Bypass list** section
4. Click **Add bypass**
5. Select **Deploy keys**
6. Click **Save changes**

That's it! The standard `GITHUB_TOKEN` used by workflows can now bypass the PR requirement for pushing version bumps.

**Why this works:** Adding "Deploy keys" to the bypass list allows repository-level automation tokens (like `GITHUB_TOKEN`) to bypass branch protection rules without requiring a Personal Access Token.

---

## What These Rulesets Protect Against

✅ Direct commits to `test` or `main` branches (humans)  
✅ Force pushes that rewrite history  
✅ Branch deletion  
✅ Merging unreviewed code  
✅ Merging failing code  
✅ Creating PRs without proper checks

## What's Still Allowed

✅ GitHub Actions bot pushing version bumps to `test`  
✅ Pull requests from feature branches to `test` (default target, with squash merge)  
✅ Pull requests from `test` to `main` (must manually select main as target)  
✅ Creating and pushing feature branches freely  
✅ Admin emergency bypass of create/delete/force push restrictions (with caution)

---

## Testing Your Configuration

### Test 1: Create PR to test (should work)

```bash
git checkout -b feature/test-rulesets
echo "test" > test.txt
git add test.txt
git commit -m "test branch protection"
git push origin feature/test-rulesets
# Create PR to test → should work
```

### Test 2: Try direct push to test (should fail)

```bash
git checkout test
git pull
echo "direct" > direct.txt
git add direct.txt
git commit -m "direct commit"
git push origin test
# Should fail with: "push declined due to repository rule violations"
```

### Test 3: Try direct push to main (should fail)

```bash
git checkout main
git pull
echo "direct" > direct.txt
git add direct.txt
git commit -m "direct commit"
git push origin main
# Should fail with: "push declined due to repository rule violations"
```

---

## Troubleshooting

**Issue:** Workflow fails with "push declined due to repository rule violations"  
**Solution:**

- Verify "Restrict updates" is OFF in the `protected-branches-common` ruleset
- Check that the workflow is using GITHUB_TOKEN (default)
- Ensure the workflow has `contents: write` permission

**Issue:** Can't merge PR even with approvals and passing checks  
**Solution:**

- Verify the version label is present (for test branch)
- Check that all status checks are passing (green checkmark)
- Ensure all conversations are resolved
- Verify you have the required number of approvals

**Issue:** Status check doesn't appear in the dropdown  
**Solution:**

- Status checks only appear after they run at least once
- Push a test PR and let the workflow complete
- Then go back and edit the ruleset to add the status check

**Issue:** Ruleset doesn't seem to be enforcing  
**Solution:**

- Verify **Enforcement status** is **Active** (not Evaluate or Disabled)
- Check the target branch pattern matches exactly (case-sensitive)
- Confirm you're not on a private repo with a free account

---

## Maintenance

### Updating Rulesets

To modify a ruleset:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click on the ruleset name
3. Make your changes
4. Click **Save changes** at the bottom

### Disabling Temporarily

To temporarily disable enforcement:

1. Go to the ruleset settings
2. Change **Enforcement status** to **Disabled**
3. Remember to re-enable when done!

### Deleting Rulesets

Only delete if you're sure:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click the ruleset name
3. Scroll to bottom and click **Delete ruleset**
