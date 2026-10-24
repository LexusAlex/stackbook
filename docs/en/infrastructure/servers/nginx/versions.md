---
title: Versions
description: NGINX Open Source versioning — mainline and stable branches, release numbers and Docker tags.
sidebarOrder: 10
lastVerified: '2026-10-24'
---

# Versions

**Verified on 24 October 2026.** This article covers NGINX Open Source. The versions below are a dated snapshot, not an automatically updated feed.

## Current branches

| Branch | Latest release | Release date |
| --- | --- | --- |
| **Mainline** — `1.31.x` | `1.31.8` | 21 October 2026 |
| **Stable** — `1.30.x` | `1.30.6` | 14 October 2026 |

The `1.28.x` series is now listed under **Legacy versions**. An available archive does not make a branch the current stable release. Check the [download page](https://nginx.org/en/download.html) for current versions and the [mainline](https://nginx.org/en/CHANGES) and [stable 1.30](https://nginx.org/en/CHANGES-1.30) changelogs for release dates.

## Reading a version number

For `1.30.6`:

| Component | Meaning |
| --- | --- |
| `1` | Major version series |
| `30` | Development and maintenance branch |
| `6` | Release number within that branch |

The **middle number** identifies the branch type: odd means mainline (`1.31.x`), even means stable (`1.30.x`). The last number's parity does not matter. See the [official versioning documentation](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#stable-and-mainline-versions).

::: info The last number does not mean “fixes only”
Mainline can gain features when only the third number changes: `1.31.5`, for example, introduced a control API and a JSON module. Consequently, assuming that a patch-shaped update cannot change functionality is unsafe. This follows from the [mainline changelog](https://nginx.org/en/CHANGES); read the notes for each update.
:::

## Mainline and stable

**Mainline** receives new features, behavior changes and fixes. **Stable** receives selected critical backports from mainline, keeping its feature set steadier. Stable does not mean bug-free. The distinction is documented in the [Nginx repository](https://github.com/nginx/nginx#stable-and-mainline-binaries).

The official guide recommends mainline for production and stable for stricter change-stability requirements. Mainline is therefore not simply a beta channel. See the [NGINX recommendation](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#mainline-version).

Also check [security advisories](https://nginx.org/en/security_advisories.html), which identify affected and fixed releases. A stable label alone does not establish that an installed package contains every applicable security fix.

## How branches evolve

A stable branch captures the previous mainline's development, while work moves to the next odd-numbered branch. The current cycle illustrates this:

```text
1.29.x — previous mainline
   └── 1.30.0 — new stable, 14 April 2026

1.31.0 — next mainline, 13 May 2026
```

The [official 2026 announcements](https://nginx.org/2026.html) describe `1.30.0` as incorporating features and fixes from `1.29.x`. Moving between branches changes the middle number; an update within a branch changes the last number.

## Nginx versions, packages and Docker tags

These identify different things. The official Linux repositories provide separate [stable and mainline channels](https://nginx.org/en/linux_packages.html). Package versions may include additional suffixes, so consider the package source and its changelog rather than just the first three numbers.

For the official Docker image on the verification date:

| Tag | Points to |
| --- | --- |
| `nginx:mainline`, `nginx:latest` | Current mainline — `1.31.8` |
| `nginx:stable` | Current stable — `1.30.6` |
| `nginx:1.31`, `nginx:1.30` | Current release in that branch |
| `nginx:1.31.8`, `nginx:1.30.6` | The specified Nginx version |
| The `-alpine` suffix | An Alpine Linux image variant |

See the [official image manifest](https://github.com/docker-library/official-images/blob/master/library/nginx). Here, `latest` follows mainline.

Tags are mutable references: a full version selects the Nginx version but does not make every image layer immutable. Pin an [image digest](https://docs.docker.com/dhi/core-concepts/digests/) for reproducible deployment.

## Checking an installed version

```sh
nginx -v
nginx -V
```

`-v` prints the available binary's version. `-V` also reports the compiler and configure arguments, helping distinguish builds with the same Nginx version. See [Command-line parameters](https://nginx.org/en/docs/switches.html).
