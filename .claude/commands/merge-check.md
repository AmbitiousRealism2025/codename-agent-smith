# /merge-check

Pre-PR merge conflict detection. Run this before pushing commits or creating pull requests.

## Usage

```
/merge-check [base-branch]
```

- `base-branch`: Optional. Defaults to `main`. The branch you intend to merge into.

## Instructions

When this command is invoked, execute the following steps:

### 1. Capture Current State

```bash
# Store current branch name
git branch --show-current
```

### 2. Fetch Latest Remote

```bash
git fetch origin
```

### 3. Check for Divergence

```bash
# Show commits on base that aren't in current branch
git log --oneline HEAD..origin/<base-branch> | head -10
```

If no output, report: "Branch is up-to-date with origin/<base-branch>. No merge needed."

### 4. Perform Dry-Run Merge

If there are divergent commits:

```bash
# Attempt merge without committing
git merge --no-commit --no-ff origin/<base-branch>
```

### 5. Report Results

**If merge succeeds (exit code 0):**
- Report: "No merge conflicts detected. Safe to proceed with PR."
- Abort the test merge: `git merge --abort`

**If merge fails (conflicts detected):**
- List the conflicted files: `git diff --name-only --diff-filter=U`
- Report each conflicted file
- Abort the test merge: `git merge --abort`
- Ask user: "Would you like me to merge <base-branch> now to resolve these conflicts?"

### 6. Cleanup

Always ensure we return to clean state:

```bash
git merge --abort 2>/dev/null || true
```

## Output Format

```
## Merge Check Results

**Current Branch:** <branch-name>
**Target Branch:** origin/<base-branch>
**Status:** <UP-TO-DATE | NO CONFLICTS | CONFLICTS DETECTED>

### Divergence
- <N> commits on origin/<base-branch> not in current branch
- <M> commits on current branch not in origin/<base-branch>

### Conflicts (if any)
- path/to/conflicted/file1.ts
- path/to/conflicted/file2.ts

### Recommendation
<Action recommendation based on findings>
```
