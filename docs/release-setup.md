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

The third secret (`NPM_TOKEN`, for publishing) is unchanged — see the main README.

### 5. Verify

Push an empty commit to `main` (or add a dummy changeset and merge a PR). The release workflow should:

1. Generate a short-lived App token.
2. Either open a "Version packages" PR (authored by the GitHub App, e.g. `code-sherpas-releases[bot]`), or publish to npm if the Version PR was merged.

Confirm that `ci.yml` now runs against the Version PR. If it does, branch protection can merge it normally.

## Migrating other repos (pharos-react, alexandria-design, ...)

The same GitHub App can be installed on multiple repos. For each repo:

1. Install the app on the repo (step 3 above).
2. Add the two secrets (step 4).
3. Mirror the `release.yml` structure with `secrets.RELEASE_APP_ID` / `secrets.RELEASE_APP_PRIVATE_KEY`.

No need to create a new app per repo.
