# Pre-PR Validation Integration Guide

## Quick Start

### Manual Usage (Available Now)

Invoke the skill before creating a PR:

```bash
# In conversation with Claude Code
/pre-pr-validation

# Or just say:
"Run pre-PR validation checks before creating this PR"
```

Claude will:
1. ✅ Check for merge conflicts with `main`
2. ✅ Run `bun run typecheck`
3. ⚠️  Run `bun run lint` (warnings only)
4. Present summary and ask to proceed

---

## Integration Phases

### Phase 1: Manual Invocation (NOW) ✅

**Status:** Ready to use immediately

**Usage:**
```
User: I'm ready to create a PR
Claude: Let me run pre-PR validation first...
        [Runs checks]
        All checks passed! Creating PR...
```

**Add to workflow:** Update `CLAUDE.md` Git Workflow section:

```markdown
## Pre-PR Validation (Recommended)

Before creating PRs, run `/pre-pr-validation` to:
- Detect merge conflicts with main
- Catch type errors early
- Surface code quality issues
```

### Phase 2: Automatic Invocation (NEXT)

**Status:** Planned integration with `sc-git` skill

**Goal:** Automatically run validation when user requests PR creation

**Implementation:** Update `sc-git` skill to call `pre-pr-validation` before `gh pr create`

**User experience:**
```
User: Create a PR for feature/new-validation
Claude: Running pre-PR validation...
        ✅ All checks passed
        Creating PR...
```

No need to manually invoke `/pre-pr-validation` anymore.

### Phase 3: RULES.md Integration (LATER)

**Status:** Make it mandatory via framework

**Goal:** Enforce pre-PR validation as a CRITICAL rule

**Add to `~/.claude/RULES.md` Git Workflow:**

```markdown
## Git Workflow
**Priority**: 🔴 **Triggers**: All development tasks

- **Always Check Status First**: Start every session with `git status && git branch`
- **Feature Branches Only**: Create feature branches for ALL work, never on main/master
- **Pre-PR Validation (MANDATORY)**: Before creating PRs:
  1. Run `/pre-pr-validation` skill
  2. Fix any blocking issues (conflicts, type errors)
  3. Only create PR after validation passes
- **Incremental Commits**: Commit frequently with meaningful messages
```

This makes it part of your core workflow rules that Claude must follow.

---

## Testing the Skill

### Test 1: Happy Path (All Pass)

```bash
# Create a feature branch with clean changes
git checkout -b test/pre-pr-validation
# Make some changes
echo "// Test" >> packages/web/src/test.ts
git add . && git commit -m "test: validation skill"

# Run validation
/pre-pr-validation
# Expected: All checks pass ✅
```

### Test 2: Merge Conflicts

```bash
# Create conflicts deliberately
git checkout main
echo "conflict" >> README.md
git add . && git commit -m "main change"

git checkout test/pre-pr-validation
echo "different" >> README.md
git add . && git commit -m "branch change"

# Run validation
/pre-pr-validation
# Expected: Conflict detection ⚠️
```

### Test 3: Type Errors

```bash
# Introduce type error
echo "const x: string = 123;" >> packages/web/src/test.ts
git add . && git commit -m "type error"

# Run validation
/pre-pr-validation
# Expected: Type check fails ❌
```

### Test 4: Lint Warnings

```bash
# Introduce lint issue
echo "let unused = 1;" >> packages/web/src/test.ts
git add . && git commit -m "lint warning"

# Run validation
/pre-pr-validation
# Expected: Lint warning ⚠️ (non-blocking)
```

---

## Configuration for This Project

Located at: `.claude/pre-pr-config.yaml`

**Current settings:**
- ✅ Merge check: **ON** (blocking)
- ✅ Type check: **ON** (blocking) via `bun run typecheck`
- ⚠️  Lint: **ON** (warning) via `bun run lint`
- ⏸️  Tests: **OFF** (enable manually for critical PRs)

**To enable tests before PR:**

```yaml
test:
  enabled: true
  blocking: true  # or false for warnings only
  mode: "all"
  command: "bun run test"
```

---

## Benefits

### Before (Without Validation)

```
User: Create PR
Claude: *creates PR*
GitHub CI: ❌ Type errors in App.tsx
          ❌ Merge conflicts
User: Fix these issues
Claude: *fixes and pushes*
GitHub CI: ✅ All checks pass
```

**Time wasted:** 10-15 minutes waiting for CI failures

### After (With Validation)

```
User: Create PR
Claude: Running validation...
        ❌ Type errors detected
        Shall I fix these?
User: Yes
Claude: *fixes errors*
        ✅ All checks pass
        Creating PR...
GitHub CI: ✅ All checks pass
```

**Time saved:** Catch issues in 30 seconds locally, not 10 minutes in CI

---

## Customization Examples

### Example 1: Add Bundle Size Check

```yaml
custom_checks:
  - name: "Bundle size check"
    command: "bun run build && du -sh packages/web/dist | awk '{print $1}'"
    blocking: false
```

### Example 2: Enable E2E Tests for Critical PRs

```yaml
test:
  enabled: true
  blocking: true
  command: "bun run test:e2e"
  timeout: 600  # E2E tests can be slow
```

### Example 3: Strict Mode (All Checks Blocking)

```yaml
lint:
  enabled: true
  blocking: true  # Make lint warnings block PR

test:
  enabled: true
  blocking: true  # Require tests to pass
```

---

## Troubleshooting

### Issue: "No type checker found"

**Cause:** Can't detect `typecheck` script
**Fix:** Verify `package.json` has:

```json
{
  "scripts": {
    "typecheck": "tsc -b"
  }
}
```

Or set explicit command in config:

```yaml
type_check:
  command: "bun run tsc --noEmit"
```

### Issue: Validation takes too long

**Cause:** Running full test suite
**Fix:** Disable tests or use `changed` mode:

```yaml
test:
  enabled: true
  mode: "changed"  # Only test changed files
```

### Issue: False merge conflicts

**Cause:** Complex git history
**Fix:** Run manual check:

```bash
git fetch origin main
git merge-base HEAD origin/main
git diff HEAD origin/main
```

---

## Next Steps

1. ✅ **Try it now:** Run `/pre-pr-validation` on your next PR
2. ⏸️  **Measure impact:** Track how many issues it catches before CI
3. ⏸️  **Tune config:** Adjust blocking/warning based on your workflow
4. ⏸️  **Integrate with sc-git:** Make it automatic (Phase 2)
5. ⏸️  **Add to RULES.md:** Enforce as mandatory (Phase 3)

---

## Files Created

```
~/.config/opencode/superpowers/skills/pre-pr-validation/
└── SKILL.md                                    # Main skill implementation

/Users/ambrealismwork/Desktop/Coding-Projects/codename-agent-smith/.claude/
├── pre-pr-config.yaml                          # Project-specific config
└── PRE_PR_INTEGRATION.md                       # This file
```

---

**Ready to test?** Just say "Run pre-PR validation" or `/pre-pr-validation` in your next PR workflow!
