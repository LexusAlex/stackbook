---
title: Installing Nginx
description: A first NGINX Open Source installation on Ubuntu and Debian from the official repository — signing keys, branch selection and package verification.
sidebarOrder: 20
---

# Installing Nginx

Install NGINX Open Source from its official repository on a new Ubuntu or Debian server. The result is an installed package from the chosen branch, with its version, executable location and configuration checked.

## Before you start

You need SSH access, a user with `sudo`, and internet connectivity. Run the commands in a Linux terminal. This guide covers a first installation; if Nginx is already installed, identify its package source and preserve the existing configuration first.

As of **24 October 2026**, the official repository supports Ubuntu 22.04, 24.04 and 26.04, and Debian 12 and 13 on `amd64` and `arm64`. Check the [supported systems](https://nginx.org/en/linux_packages.html#distributions) before installing.

Inspect your operating system and architecture:

```sh
. /etc/os-release
printf '%s; codename=%s\n' "$PRETTY_NAME" "$VERSION_CODENAME"
dpkg --print-architecture
```

## 1. Choose the source and branch

Packages are available from the distribution repositories and from `nginx.org`. This series uses **the official Nginx repository and mainline**. See [Versions](./versions) for branch differences and the [NGINX guide](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#distribution-and-installation-methods) for installation options.

To use stable, choose the alternative repository address below. Configure one branch.

## 2. Prepare the tools and keys

Run the block for your distribution:

::: code-group

```sh [Ubuntu]
sudo apt update
sudo apt install curl gnupg2 ca-certificates ubuntu-keyring
```

```sh [Debian]
sudo apt update
sudo apt install curl gnupg2 ca-certificates debian-archive-keyring
```

:::

Save the repository keys in a dedicated file and display their fingerprints:

```sh
sudo install -d -m 0755 /etc/apt/keyrings
sudo curl -fsSL https://nginx.org/keys/nginx_signing.key \
  -o /etc/apt/keyrings/nginx.asc
sudo chmod 0644 /etc/apt/keyrings/nginx.asc
gpg --show-keys --with-fingerprint /etc/apt/keyrings/nginx.asc
```

At the time of writing, [NGINX publishes three full fingerprints](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#debian-packages):

```text
8540A6F18833A80E9C1653A42FD21310B49F6B46
573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
9E9BE90EACBCDE69FE9B204CBCDCD8A38D88A2B3
```

Compare full fingerprints, ignoring spaces in the output. Continue only when the set matches the current official documentation. `gpg --show-keys` displays the file without importing keys into your key store. See the [GnuPG options](https://www.gnupg.org/documentation/manuals/gnupg24/gpg.1.html).

## 3. Add the repository

Run the entire block. `ID` and `VERSION_CODENAME` come from the installed operating system, such as `ubuntu` and `noble`, or `debian` and `trixie`.

```sh
. /etc/os-release
nginx_repo=https://nginx.org/packages/mainline

sudo tee /etc/apt/sources.list.d/nginx.sources >/dev/null <<EOF
Types: deb
URIs: ${nginx_repo}/${ID}
Suites: ${VERSION_CODENAME}
Components: nginx
Signed-By: /etc/apt/keyrings/nginx.asc
EOF
```

For **stable**, replace the `nginx_repo` value in this block with `https://nginx.org/packages`, then run the block with that value. The branch URLs are documented in the [Nginx instructions](https://nginx.org/en/linux_packages.html#instructions).

The `.sources` file uses deb822 format. `Signed-By` associates this source with its own key file; `apt-key` is unnecessary. See the [sources.list format](https://manpages.debian.org/trixie/apt/sources.list.5.en.html#DEB822-STYLE_FORMAT) and [APT authentication](https://manpages.debian.org/trixie/apt/apt-secure.8.en.html#USER_CONFIGURATION).

## 4. Check which package APT will select

Set a preference for Nginx and its modules from `nginx.org`:

```sh
sudo tee /etc/apt/preferences.d/99nginx >/dev/null <<'EOF'
Package: nginx nginx-module-*
Pin: origin "nginx.org"
Pin-Priority: 900
EOF

sudo apt update
LC_ALL=C apt-cache policy nginx
```

`Candidate` is the selected installation version. Locate it in the same command's version table: its source should be `nginx.org`, with your chosen branch and operating system. Its expected priority is `900`.

If APT selects an Ubuntu/Debian package instead, check the address, release codename and preferences file before installing. For priorities and `policy` output, see [apt_preferences](https://manpages.debian.org/trixie/apt/apt_preferences.5.en.html) and [apt-cache](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html).

## 5. Install Nginx

```sh
sudo apt install nginx
```

Review the proposed package changes and confirm installation.

## 6. How to check that Nginx is installed

Check the package, executable, version and configuration on the server where you installed Nginx. `LC_ALL=C` makes diagnostic messages use English so they can be compared with the examples below.

### Package status

```sh
LC_ALL=C dpkg-query -W -f='Package: ${binary:Package}\nStatus: ${Status}\nVersion: ${Version}\n' nginx
```

The output has this structure, where `<package-version>` is your actual package build number:

```text
Package: nginx
Status: install ok installed
Version: <package-version>
```

A regular installation should report `install ok installed`: the package is unpacked and configured. If updates are held, the first word may be `hold`; `ok installed` still indicates an installed package.

| Other result | Meaning |
| --- | --- |
| `deinstall ok config-files` | The package was removed, leaving configuration files |
| A status ending in `unpacked` or `half-configured` | Package installation or configuration is incomplete |
| `no packages found matching nginx` | The dpkg database has no matching package entry |

This check covers dpkg packages. A manually compiled Nginx in another directory can exist without a package entry. See [dpkg-query](https://manpages.debian.org/trixie/dpkg/dpkg-query.1.en.html) and [package states](https://manpages.debian.org/trixie/dpkg/dpkg.1.en.html#INFORMATION_ABOUT_PACKAGES).

### Executable and location

List the package files:

```sh
dpkg-query -L nginx
```

For this package installation, expect `/usr/sbin/nginx` and `/etc/nginx/nginx.conf`. Check that the executable exists and identify the package owning that path:

```sh
ls -l /usr/sbin/nginx
dpkg-query -S /usr/sbin/nginx
```

The first command should show a file with executable permissions (`x`); the second should report `nginx: /usr/sbin/nginx`. If the file is missing, a database entry alone is insufficient: investigate why the package contents do not match the installed state.

### Version and build options

Use the executable's full path to avoid depending on `PATH` or another Nginx installation:

```sh
sudo /usr/sbin/nginx -v
sudo /usr/sbin/nginx -V
```

`-v` prints a line shaped like `nginx version: nginx/<nginx-version>`. Compare it with the upstream part of the package version: the package build suffix is not included in this line.

`-V` also prints compiler and build options. In particular, `--conf-path` sets the default configuration path, `--sbin-path` sets the executable's installation path, and `--with-…` options describe features included at build time. See the [command-line parameters](https://nginx.org/en/docs/switches.html) and [build options](https://nginx.org/en/docs/configure.html).

### Installed version and source

```sh
LC_ALL=C apt-cache policy nginx
```

- `Installed` is the installed package version; `(none)` means APT sees no installed package.
- `Candidate` is the version APT would select for installation or upgrade. It can be newer than the installed version.
- Find the `Installed` version in the version table and its corresponding `nginx.org` address with the selected branch.

The `/var/lib/dpkg/status` entry represents local package records. `policy` matches versions to currently available sources, but does not record the original installation history. In this workflow, compare the `Candidate` selected before installation with the resulting `Installed` version. See [apt-cache](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html).

### Configuration check

```sh
sudo /usr/sbin/nginx -t
```

A successful result for the default configuration looks like this:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

`-t` checks syntax and whether referenced files can be opened. It does not start the service or apply changes to a running process. If it fails, read the reported file path and line number: an installed executable can work even when the configuration needs correction.

### Installed or already running

Package presence and service state are separate checks. On a systemd server, inspect the state without starting or stopping Nginx:

```sh
systemctl is-active nginx
```

| Result | Meaning |
| --- | --- |
| `active` | The service is active |
| `inactive` | The service is inactive; the package may still be installed |
| `failed` | The service failed; this does not mean the package is absent |

Even `active` alone does not establish HTTP availability, which also depends on the listening address, port, configuration and network. See the [systemctl documentation](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html#is-active%20PATTERN%E2%80%A6) for service states.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `404` or a missing `Release` file | Whether `ID` and the codename match a supported system. Do not substitute a different release codename |
| `NO_PUBKEY` or a signature error | Whether the key download succeeded, fingerprints match, and the file referenced by `Signed-By` exists and is readable |
| `Conflicting values set for option Signed-By` | Whether another `.list` or `.sources` file defines the same repository; keep one consistent entry |
| `Candidate: (none)` or a distribution package is selected | Whether `apt update` succeeded and the source URL and priority are correct |
| `nginx: command not found` | Whether the package and `/usr/sbin/nginx` exist; if the file exists, try its full path and check `PATH` |
| An error from `nginx -t` | Which file and line the message identifies; check syntax, paths and permissions |

Resolve signature errors by fixing the key or source configuration while retaining package authentication.
