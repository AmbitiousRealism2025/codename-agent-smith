# Skill Draft: Pre-PR Validation

**Status:** Draft  
**Created:** 2026-01-02  
**Purpose:** Automatic pre-PR validation including merge conflict detection, type checking, and quality gates.

---

## Overview

This skill would automatically trigger when the agent is about to:
1. Push commits to an existing PR branch
2. Create a new PR via `gh pr create`

It replaces manual `/merge-check` invocations with automatic validation.

---

## Trigger Conditions

The skill activates when the agent is about to execute:

```bash
git push origin <branch>
gh pr create ...
```

**Exclusions:**
- Pushing to `main` or `master` directly (should be blocked anyway)
- Force pushes (user explicitly requested, assume they know what they're doing)
- Commits without associated PR intent

---

## Validation Pipeline

### Stage 1: Merge Conflict Check (Blocking)

```
1. git fetch origin
2. git merge --no-commit --no-ff origin/main
3. If conflicts:
   - Report conflicted files
   - Offer to merge main into branch
   - BLOCK PR until resolved
4. git merge --abort (cleanup)
```

**Failure behavior:** Cannot proceed until conflicts resolved.

### Stage 2: Type Check (Blocking)

```
1. Detect project type (tsconfig.json, pyproject.toml, etc.)
2. Run appropriate type checker:
   - TypeScript: tsc --noEmit
   - Python: mypy or pyright
3. Report errors if any
```

**Failure behavior:** Cannot proceed until type errors fixed.

### Stage 3: Lint Check (Warning)

```
1. Detect linter config (eslint, prettier, ruff, etc.)
2. Run linter on changed files only
3. Report warnings/errors
```

**Failure behavior:** Warn but allow proceed. User can choose to fix or ignore.

### Stage 4: Test Check (Optional)

```
1. Detect test framework (vitest, jest, pytest, etc.)
2. Run tests related to changed files (if possible)
3. Report failures
```

**Failure behavior:** Configurable - can be blocking or warning.

---

## Configuration

Allow project-level configuration via `.claude/pre-pr-config.yaml`:

```yaml
pre_pr_checks:
  merge_check:
    enabled: true
    base_branch: main  # or develop, etc.
    blocking: true
    
  type_check:
    enabled: true
    blocking: true
    command: "bun run typecheck"  # override auto-detection
    
  lint:
    enabled: true
    blocking: false
    command: "bun run lint"
    
  test:
    enabled: false  # opt-in
    blocking: false
    command: "bun run test"
    changed_files_only: true
```

**Defaults if no config:**
- Merge check: enabled, blocking
- Type check: enabled, blocking (if tsconfig/pyproject exists)
- Lint: enabled, warning (if config exists)
- Test: disabled

---

## User Experience

### Before (Manual)

```
User: Create a PR for these changes
Agent: *creates PR*
GitHub: Merge conflicts detected
User: Ugh, fix the conflicts
Agent: *merges main, resolves conflicts*
User: Now create the PR
Agent: *creates PR*
```

### After (With Skill)

```
User: Create a PR for these changes
Agent: Running pre-PR validation...
       - Merge check: 3 commits behind main, checking for conflicts...
       - Conflicts detected in: schema.ts, App.tsx
       - Would you like me to merge main to resolve these?
User: Yes
Agent: *merges, resolves conflicts*
       - Merge check: PASS
       - Type check: PASS
       - Lint check: 2 warnings (non-blocking)
       Creating PR...
```

---

## Implementation Notes

### Skill File Location

```
.claude/skills/pre-pr-validation.md
```

Or as a superpower:

```
~/.claude/superpowers/pre-pr-validation.md
```

### Integration Points

The skill needs to hook into:
1. **Git push detection** - Intercept before `git push` executes
2. **PR creation detection** - Intercept before `gh pr create` executes

This may require:
- Pattern matching on bash commands about to be executed
- Or explicit invocation in the commit/PR workflow sections of agent instructions

### Recommended Approach

Add to agent's base instructions (CLAUDE.md or equivalent):

```markdown
## Pre-PR Validation (Mandatory)

Before executing `git push` or `gh pr create`, you MUST:
1. Load the pre-pr-validation skill
2. Execute all validation stages
3. Only proceed if blocking checks pass
```

This makes it behavioral rather than trying to intercept commands.

---

## Open Questions

1. **Scope:** Should this be project-specific or global (superpower)?
   - Recommendation: Start as project skill, promote to superpower if proven useful across projects

2. **Performance:** Full test suite could be slow. How to handle?
   - Recommendation: Default to changed-files-only, make full suite opt-in

3. **CI Overlap:** Many projects have CI that does these checks. Redundant?
   - Recommendation: Pre-PR check catches issues BEFORE push, saving CI cycles and time

4. **Conflict Resolution:** Should skill auto-resolve simple conflicts?
   - Recommendation: No. Always ask user. Conflict resolution can be tricky.

---

## Next Steps

1. [ ] Review this draft
2. [ ] Decide on trigger mechanism (behavioral vs interception)
3. [ ] Implement as skill
4. [ ] Test on real PR workflow
5. [ ] Iterate based on friction points
6. [ ] Consider promotion to superpower

---

## Related

- `/merge-check` slash command (immediate predecessor)
- Git workflow sections in CLAUDE.md
- CI/CD pipeline (complementary, not replacement)
