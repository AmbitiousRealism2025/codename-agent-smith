# SC:Git Quick Start Guide

## What Just Got Integrated

Your new `sc:git` skill now **automatically runs pre-PR validation** before creating pull requests. No more manual `/pre-pr-validation` calls needed!

---

## Usage Examples

### Create a PR (Automatic Validation)

```
You: "Create a PR for these changes"

OR

You: "/sc:git create PR"

Claude: Using sc:git for git operations...

        Step 1: Checking status...
        ✓ On branch: feature/new-validation
        ✓ 3 files changed, 2 commits

        Step 2: Running pre-PR validation...
        ✅ Merge conflicts: PASSED
        ✅ Type check: PASSED (bun run typecheck)
        ✅ Lint: PASSED (bun run lint)

        Step 3: Creating PR...

        Drafted PR summary:
        ────────────────────────────────────
        feat(validation): add pre-PR validation skill

        - Create pre-pr-validation skill
        - Integrate with sc:git workflow
        - Add automatic validation before PR creation

        ## Pre-PR Validation
        ✅ All checks passed
        ────────────────────────────────────

        Create PR with this description? (yes/edit/show-diff)

You: "yes"

Claude: ✅ PR created!
        View: https://github.com/user/codename-agent-smith/pull/XX
```

**Key Point:** Validation happens automatically - you don't need to invoke it!

---

### Smart Commit

```
You: "Commit these changes"

OR

You: "/sc:git commit"

Claude: Using sc:git for git operations...

        Analyzing changes...
        - Modified: packages/web/src/lib/storage/db.ts
        - Modified: packages/web/src/stores/advisor-store.ts
        - Added: packages/web/src/lib/storage/crypto.ts

        Drafted commit message:
        ────────────────────────────────────
        feat(storage): add API key encryption

        - Implement Web Crypto API for key encryption
        - Add decrypt helper for secure key retrieval
        - Update Dexie schema for encrypted storage
        ────────────────────────────────────

        Use this message? (yes/edit/show-diff)

You: "yes"

Claude: ✅ Commit created: a1b2c3d

        Next steps:
        - Create PR (/sc:git create PR)
        - Make more changes
```

---

### Quick Push

```
You: "/sc:git push"

Claude: ✅ Pushed to origin/feature/new-validation
        3 commits pushed

        Next: Create PR? (yes/no)
```

---

## Natural Language Support

You can use natural language instead of slash commands:

| Say This | Gets Interpreted As |
|----------|---------------------|
| "Create a PR" | `/sc:git create PR` |
| "Commit these changes" | `/sc:git commit` |
| "Push my changes" | `/sc:git push` |
| "Make a new branch called auth" | `/sc:git branch auth` |

---

## Validation Integration Flow

### What Happens When You Create a PR:

```
1. sc:git checks git status
   └─ Ensures on feature branch, not main/master

2. sc:git handles uncommitted changes
   └─ Offers to commit or stash

3. sc:git invokes pre-pr-validation (AUTOMATIC)
   ├─ Merge conflict check
   ├─ Type check (bun run typecheck)
   └─ Lint check (bun run lint)

4. If validation passes:
   ├─ Analyze commits
   ├─ Draft PR summary
   ├─ Include validation results in description
   └─ Create PR via gh pr create

5. If validation fails:
   ├─ Report issues
   ├─ Offer to fix automatically
   └─ Block PR creation until resolved
```

---

## Configuration Files

### Project Configuration

**`.claude/sc-git-config.yaml`** - SC:Git behavior
```yaml
pr:
  auto_validation: true  # ← ENABLED by default
```

**`.claude/pre-pr-config.yaml`** - Validation settings
```yaml
type_check:
  command: "bun run typecheck"
  blocking: true  # ← Type errors block PR
```

---

## Comparison: Before vs After

### Before Integration

```
You: "Create a PR"
Claude: *creates PR*
GitHub CI: ❌ Type errors, merge conflicts
You: "Fix these"
Claude: *fixes issues, pushes*
GitHub CI: ✅ Passed (after 10 minutes)
```

**Time wasted:** 10-15 minutes waiting for CI

### After Integration

```
You: "Create a PR"
Claude: Running validation... (30 seconds)
        ❌ Type errors detected
        Shall I fix these?
You: "Yes"
Claude: *fixes errors, re-validates*
        ✅ All checks passed
        Creating PR...
GitHub CI: ✅ Passed immediately
```

**Time saved:** Catch issues in 30 seconds locally

---

## Advanced Usage

### Skip Validation (Not Recommended)

```
You: "Create PR without validation"

Claude: ⚠️  WARNING: Skipping validation risks CI failures

        Confirm by typing 'SKIP VALIDATION':
```

### Run Validation Independently

```
You: "/pre-pr-validation"

Claude: Running validation checks...
        [Results]

        (PR not created - validation only)
```

### Customize PR Description Before Creating

```
You: "/sc:git create PR"

Claude: [After validation passes]

        Drafted PR summary:
        [Summary]

        Options:
        1. Create PR with this description
        2. Let me edit the description first  ← Choose this
        3. Show full diff

You: "2"

Claude: Here's the drafted description in editable format:
        [Provides description]

        Make your changes and paste back when ready.
```

---

## Troubleshooting

### Issue: Validation taking too long

**Cause:** Tests enabled in pre-pr-config.yaml
**Fix:**
```yaml
# .claude/pre-pr-config.yaml
test:
  enabled: false  # Disable tests for faster validation
```

### Issue: Wrong base branch

**Cause:** Defaults to 'main', but your project uses 'develop'
**Fix:**
```yaml
# .claude/sc-git-config.yaml
sc_git:
  base_branch: develop
```

### Issue: Commit message format doesn't match project

**Cause:** Using conventional commits, but project doesn't
**Fix:**
```yaml
# .claude/sc-git-config.yaml
commit:
  conventional_commits: false
```

---

## Files Created/Updated

```
~/.config/opencode/superpowers/skills/
├── sc-git/
│   └── SKILL.md                           # NEW: Main sc:git skill
└── pre-pr-validation/
    └── SKILL.md                           # Already created

/Users/.../codename-agent-smith/.claude/
├── sc-git-config.yaml                     # NEW: SC:Git config
├── pre-pr-config.yaml                     # Already created
├── PRE_PR_INTEGRATION.md                  # Integration guide
└── SC_GIT_QUICKSTART.md                   # This file
```

---

## Next Steps

### ✅ Ready Now

1. Try it: Say "create a PR" or "/sc:git create PR"
2. Observe: Watch automatic validation in action
3. Verify: Check that validation results appear in PR description

### ⏸️ Optional

1. Customize commit message format in sc-git-config.yaml
2. Adjust validation settings in pre-pr-config.yaml
3. Add to CLAUDE.md Git Workflow section as recommended approach

---

## Benefits Summary

| Benefit | Impact |
|---------|--------|
| **Automatic validation** | No manual `/pre-pr-validation` calls |
| **Early issue detection** | Catch type errors before CI |
| **Faster iterations** | Fix locally in seconds, not in CI minutes |
| **Cleaner PRs** | Pass CI on first push |
| **Smart commits** | Consistent, meaningful commit messages |
| **Safe workflows** | Prevents PRs from main/master |

---

**You're all set!** Just say "create a PR" and watch the magic happen. The validation is now invisible and automatic. 🚀
