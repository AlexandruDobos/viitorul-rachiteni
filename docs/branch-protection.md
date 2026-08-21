# Branch protection

`main` is the branch that maps 1:1 to what runs in production. Every commit
that lands there must have gone through a PR with a green CI. The rules
below have to be enabled once per repository through the GitHub UI (they
cannot be checked into git).

## Recommended rules for `main`

1. Open **Settings → Branches → Branch protection rules → Add rule**.
2. **Branch name pattern**: `main`
3. Tick the following:

   - **Require a pull request before merging**
     - Require approvals: `1`
     - Dismiss stale approvals when new commits are pushed
     - Require review from Code Owners (uses `.github/CODEOWNERS`)
   - **Require status checks to pass before merging**
     - Require branches to be up to date before merging
     - Required status checks:
       - `Backend CI / Compile, test and package`
       - `Frontend CI / Lint and build`
   - **Require conversation resolution before merging**
   - **Require linear history** (keeps `main` easy to bisect)
   - **Do not allow bypassing the above settings** (yes, even for admins;
     this is the whole point of branch protection)

4. Leave **Allow force pushes** OFF and **Allow deletions** OFF.

## Recommended rules for `develop`

Same as above, but you may relax "Require approvals" to `0` if you're the
only person merging. The important part is CI-must-be-green.

## What this buys you

- Nobody can push directly to `main` — every change gets reviewed.
- Every merged commit already has a green CI run, so `main` is never in
  a red state; deployments from `main` (and thus `v*` tags) are safer.
- The CI checks show up as required in the PR UI and you cannot merge
  until they pass. If tests break, the PR blocks; if it lands, it's
  because tests passed. That's the loop this whole setup is aiming for.

## Tags and releases

The deploy workflow triggers on tags matching `v*.*.*` pushed to `main`
(see `.github/workflows/backend-deploy.yml`). To create a release:

```bash
git checkout main && git pull
git tag v1.2.3
git push origin v1.2.3
```

Rollback is the same, but with the previous tag. See `RELEASING.md`.
