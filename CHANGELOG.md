# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `TelemetryConfig` is now a union of `EnabledTelemetryConfig` and `DisabledTelemetryConfig`. laravel-telemetry 0.2 renders `{"v":1,"enabled":false}` when browser telemetry is off or a setting is wrong, and the old type did not allow that shape. Code that reads `url` or other fields from `readConfig()` must check `config.enabled` first.

## [0.1.2] - 2026-10-27

### Fixed

- `init()` no longer rejects when the HyperDX SDK fails to load or start, for example when a blocker blocks its script or a deploy removes it. It writes a console warning and resolves to `null`.

## [0.1.1] - 2026-10-27

### Changed

- Versions publish from GitHub Actions with npm provenance, so the npm page shows the commit and the workflow that built each one.

## [0.1.0] - 2026-10-27

### Added

- `init()` reads the config that laravel-telemetry's `@telemetry` directive renders, and starts the HyperDX browser SDK with session replay. It loads the SDK only in the browser, and only when telemetry is enabled.
- `identify()` and `anonymize()` write the `user.*` attributes, and the `userId`, `userName` and `userEmail` attributes that the HyperDX Sessions UI reads.
- `trackInertiaUser()` in `@actengage/telemetry-browser/inertia` keeps the user current after a login or a logout.
- `deployment.environment.name`, `deployment.environment` and `service.version` resource attributes.
- Version 1 of the config contract, with the `fixtures/config.v1.json` example.

[unreleased]: https://github.com/ActiveEngagement/telemetry-browser/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/ActiveEngagement/telemetry-browser/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/ActiveEngagement/telemetry-browser/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ActiveEngagement/telemetry-browser/releases/tag/v0.1.0
