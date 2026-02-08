# Common Branch Protections Ruleset

**Ruleset Name:** `protected-branches-common`

This ruleset provides shared protections that apply to both `test` and `main` branches, including creation/deletion restrictions and force push blocking.

---

## Configuration

### Ruleset Name and Status

- **Ruleset Name:** `protected-branches-common`
- **Enforcement status:** **Active**

### Target Branches

Add **two targets** to apply this ruleset to both branches:

1. **Include by pattern:** `test`
2. **Include by pattern:** `main`

Click **Add target** twice to add both patterns.

---

## Rules

Expand **"Branch protections"** section and configure:

### ✅ Restrict creations

**Toggle ON**

**Purpose:** Prevents recreating the branch if it gets deleted accidentally.

### ✅ Restrict deletions

**Toggle ON**

**Purpose:** Prevents deleting the protected branches.

### ❌ Restrict updates

**Leave OFF**

**Why OFF:**

- Allows GitHub Actions to push version bumps to `test` branch
- The PR requirements in the branch-specific rulesets prevent human direct pushes
- If enabled, the automated versioning workflow would fail

### ❌ Require a pull request before merging

**Leave OFF** - Handled in branch-specific rulesets

### ❌ Require status checks to pass before merging

**Leave OFF** - Handled in branch-specific rulesets

### ❌ Require conversation resolution before merging

**Leave OFF** - Handled in branch-specific rulesets

### ❌ Require signed commits

**Leave OFF**

### ❌ Require linear history

**Leave OFF**

### ❌ Require deployments to succeed

**Leave OFF**

### ✅ Block force pushes

**Toggle ON**

**Purpose:** Prevents force pushes to both test and main branches. This is a shared protection rule that applies to both branches.

---

## Bypass List

**Add Repository Admins with "Pull request only" mode:**

1. Click **Add bypass**
2. Select **Repository roles**
3. Select **Repository admin**
4. For **Bypass mode**, select **Pull request only**

**Note:** Since this ruleset has no PR requirements, "Pull request only" vs "Always" has the same effect here. We choose "Pull request only" for semantic clarity and safer defaults.

### What This Bypass Allows

Admins can bypass **the rules in THIS ruleset**:

- ✅ Create branches named `test` or `main` (bypasses "Restrict creations")
- ✅ Delete the `test` or `main` branches (bypasses "Restrict deletions")
- ✅ Force push to `test` or `main` (bypasses "Block force pushes")

### What About GitHub Actions?

GitHub Actions workflows can push to test/main because:

- "Restrict updates" is **OFF** in this ruleset
- The GITHUB_TOKEN inherently bypasses these infrastructure rules
- This allows automated version bumps to work

### When to Use Admin Bypass

Only use in extreme circumstances:

- Recreating a deleted branch after an accident
- Force pushing to fix corrupted history
- Emergency repository maintenance

**Important:** This bypass only affects the infrastructure rules in this ruleset. The test and main branch rulesets (which have no bypass) still enforce PR requirements, status checks, and approvals.

---

## Purpose

This ruleset provides shared protections for both branches:

- Prevents accidental deletion of test and main branches
- Prevents accidental recreation (which could bypass other rules)
- Blocks force pushes that rewrite history
- Allows flexibility for emergencies via admin bypass
- Separates "infrastructure" protections from "workflow" rules

By keeping create/delete/force push restrictions separate from PR requirements, we get:

- **Strict enforcement** of PR workflow (no bypass)
- **Flexible enforcement** of branch existence (admin bypass available)
- **Clean separation** of concerns (easier to understand and maintain)
