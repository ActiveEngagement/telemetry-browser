# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `init()` reads the config that laravel-telemetry's `@telemetry` directive renders, and starts the HyperDX browser SDK with session replay. It loads the SDK only in the browser, and only when telemetry is enabled.
- `identify()` and `anonymize()` write the `user.*` attributes, and the `userId`, `userName` and `userEmail` attributes that the HyperDX Sessions UI reads.
- `trackInertiaUser()` in `@actengage/telemetry-browser/inertia` keeps the user current after a login or a logout.
- `deployment.environment.name`, `deployment.environment` and `service.version` resource attributes.
- Version 1 of the config contract, with the `fixtures/config.v1.json` example.
