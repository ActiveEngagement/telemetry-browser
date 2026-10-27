# Telemetry Browser

Browser RUM for ActiveEngagement Laravel apps. Reads the config that [laravel-telemetry](https://github.com/ActiveEngagement/laravel-telemetry)'s `@telemetry` directive renders, and starts the [HyperDX browser SDK](https://www.npmjs.com/package/@hyperdx/browser) with session replay.

The package pins `@hyperdx/browser`, so every app records with the same SDK version. Apps do not install the SDK themselves.

## Installation

```bash
bun add @actengage/telemetry-browser
```

## Usage

Render the directive in the root Blade layout, before the app's scripts:

```blade
<head>
    @telemetry
    @vite(['resources/js/app.ts'])
</head>
```

Start telemetry in the app's entry point:

```ts
import { init } from '@actengage/telemetry-browser';

void init();
```

`init()` loads the SDK lazily and only in the browser. It does nothing when telemetry is disabled in the server config, and it loads the SDK once, however often it is called.

### Inertia

laravel-telemetry shares the signed-in user as the `telemetry.user` prop. `trackInertiaUser()` keeps the identified user current after a login or a logout without a full page load:

```ts
import { router } from '@inertiajs/vue3';
import { init } from '@actengage/telemetry-browser';
import { trackInertiaUser } from '@actengage/telemetry-browser/inertia';

void init();
trackInertiaUser(router);
```

It identifies the user again only when the user id changes. To read the user from another prop, pass `user: (page) => page.props.auth.user`.

### Identify a user by hand

```ts
import { anonymize, identify } from '@actengage/telemetry-browser';

identify({ id: 7, name: 'Ada Lovelace', email: 'ada@example.com' });
anonymize();
```

Both write the OTel `user.id`, `user.name` and `user.email` attributes, and the `userId`, `userName` and `userEmail` attributes that the HyperDX Sessions UI reads. `anonymize()` blanks them.

## Settings

Settings live in laravel-telemetry's `telemetry.browser` config. Pass to `init()` only what JSON cannot carry. These override the tag:

```ts
void init({
    tracePropagationTargets: [/api\.example\.com/],
    ignoreUrls: [/\/livewire\/update/],
});
```

An app that does not render `@telemetry` passes the whole config instead: `init({ config })`.

`init()` resolves to the HyperDX SDK, or `null` when telemetry is off, for calls such as `addAction()` and `recordException()`.

## The config contract

The directive renders `<script id="telemetry-config" type="application/json">`. [`fixtures/config.v1.json`](fixtures/config.v1.json) is an example, and laravel-telemetry tests its output against the same file.

The `v` field is the major version of the shape. New optional fields do not change it. When `v` is a version this package does not know, `init()` writes a console warning and does not start.

The directive also renders `<meta name="traceparent">`. The SDK's document-load instrumentation reads it, so the first page load joins the server's trace.

## Development

```bash
bun install
bun run typecheck
bun run test
bun run build
```

### Changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). CI runs `bin/changelog check`, which rejects other formats.

- Add each notable change to `## [Unreleased]`, under `### Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` or `Security`.
- A PR that does not change `CHANGELOG.md` fails the `Changelog` check. For changes to tests, CI or internal code, add the `skip-changelog` label.
- Do not add release headings, links or the `package.json` version by hand. `bin/changelog release` adds them.

### Releases

1. On a new branch, run `bin/changelog release patch` (or `minor` or `major`). It moves the `Unreleased` entries to the new version, sets the version in `package.json`, and prints the version.
2. Commit `CHANGELOG.md` and `package.json` as `chore: release vX.Y.Z` and open a PR.
3. When the PR merges, the `release` workflow tags the commit, creates the GitHub release with the entries, and publishes the version to npm.

## License

MIT
