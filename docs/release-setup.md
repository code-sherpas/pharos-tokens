# Release workflow setup

This document walks through the one-time setup required for
`.github/workflows/release.yml` to work.

## Why a GitHub App (and not `GITHUB_TOKEN`)

`changesets/action@v1` opens a "Version packages" PR after every push to
`main` that contains pending changesets. If that PR is authored by the
default `GITHUB_TOKEN`, **no other workflow runs against it** — GitHub
deliberately suppresses `pull_request` / `push` events triggered by
`GITHUB_TOKEN` to avoid recursive workflow loops. As a result, `ci.yml`
never runs on the Version PR and branch protection keeps it unmergeable.

To break out of that trap we use a dedicated GitHub App as the author of
the Version PR. Events authored by a GitHub App **do** trigger workflows,
so `ci.yml` runs as expected.

## One-time setup

### 1. Create the GitHub App

1. Go to `https://github.com/organizations/code-sherpas/settings/apps/new`.
2. Set the following:
   - **GitHub App name**: `code-sherpas-releases` (or similar — must be globally unique).
   - **Homepage URL**: the repo URL is fine.
   - **Webhook → Active**: **unchecked** (we don't need webhooks).
   - **Repository permissions**:
     - `Contents`: Read and write (push commits, create tags).
     - `Pull requests`: Read and write (open the Version PR).
     - `Metadata`: Read (mandatory).
   - **Organization permissions**: none.
   - **Where can this GitHub App be installed?**: _Only on this account_.
3. Create the app.

### 2. Generate a private key

On the app's settings page, scroll to **Private keys** → **Generate a private key**. A `.pem` file will download. Keep it safe; it cannot be re-downloaded.

### 3. Install the app on the repo

In the app's **Install App** tab, install it on `code-sherpas/pharos-tokens` (and any other repo that will use this pattern — `pharos-react`, `alexandria-design`, etc.).

### 4. Add the two required secrets

On `https://github.com/code-sherpas/pharos-tokens/settings/secrets/actions` add:

| Name                      | Value                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `RELEASE_APP_ID`          | The App ID shown on the app's settings page (a short integer). |
| `RELEASE_APP_PRIVATE_KEY` | The entire contents of the `.pem` file from step 2.            |

No NPM token is needed anymore — npm publish authenticates with Trusted Publishing (see next section).

### 5. Verify

Push an empty commit to `main` (or add a dummy changeset and merge a PR). The release workflow should:

1. Generate a short-lived App token.
2. Either open a "Version packages" PR (authored by the GitHub App, e.g. `code-sherpas-releases[bot]`), or publish to npm if the Version PR was merged.

Confirm that `ci.yml` now runs against the Version PR. If it does, branch protection can merge it normally.

## npm Trusted Publishing (OIDC)

Since 0.1.1 the release workflow authenticates to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) instead of a long-lived token. Advantages:

- No `NPM_TOKEN` secret to rotate or leak.
- Every publish is signed with a provenance attestation linking it to the exact commit + workflow run; consumers can verify the origin via `npm audit signatures`.

### One-time npm configuration

1. Sign in to `https://www.npmjs.com/package/@code-sherpas/pharos-tokens/access`.
2. Under **Trusted Publishers**, click **Add trusted publisher** and configure:
   - **Publisher**: GitHub Actions.
   - **Organization or user**: `code-sherpas`.
   - **Repository**: `pharos-tokens`.
   - **Workflow filename**: `release.yml`.
   - **Environment name**: (leave empty unless you add a GitHub Environment later).
3. Save.

### Requirements on the workflow (already in place)

- `permissions.id-token: write` at the workflow level (required for OIDC).
- No `NPM_TOKEN` / `NODE_AUTH_TOKEN` in the env of the publish step.
- `publishConfig.provenance: true` in `package.json` so `npm publish` emits the attestation.

### Order of operations when migrating from token to Trusted Publishing

1. Add the Trusted Publisher in npmjs.com (step above). Leaving the old token active is fine in the interim.
2. Merge the PR that removes `NPM_TOKEN` from the workflow and adds `provenance: true`. Next release publishes via OIDC.
3. After a successful OIDC-based publish, delete the `NPM_TOKEN` GitHub secret and revoke the token in `https://www.npmjs.com/settings/<user>/tokens`.

## Migrating other repos (pharos-react, alexandria-design, ...)

The same GitHub App and the same Trusted Publishing pattern can be replicated on every repo:

1. Install the app on the repo (step 3 above).
2. Add the two secrets (step 4).
3. Mirror the `release.yml` structure with `secrets.RELEASE_APP_ID` / `secrets.RELEASE_APP_PRIVATE_KEY` and no npm token.
4. Configure a Trusted Publisher on npmjs.com for each scoped package.

No need to create a new GitHub App per repo.
