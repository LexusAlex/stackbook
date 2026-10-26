---
title: Configuration structure
description: Find nginx.conf, understand the http, server and location contexts, trace include directives and inspect included files with nginx -T.
sidebarOrder: 50
---

# Configuration structure

Find the main Nginx file and trace how it includes site settings. By the end, you should be able to name the file containing a particular `server` block, explain its place in the configuration and check that Nginx reads it.

## Before you start

You need an Ubuntu or Debian server with Nginx installed and `sudo` access. Installation is covered in [Installing Nginx](./installation), and managing the packaged service is covered in [Startup and boot configuration](./startup).

This exercise only requires inspecting existing files. The examples show their structure; you do not need to replace the packaged `nginx.conf` with them.

## 1. Find the main file

Inspect the build parameters and the command used to start the packaged service:

```sh
/usr/sbin/nginx -V 2>&1
systemctl cat nginx.service --no-pager
```

Find `--conf-path` in the `-V` output. For the packages discussed here, it is usually `/etc/nginx/nginx.conf`. Check `ExecStart` and any overrides in the unit: `-c` selects a different main file, while `-p` changes the path prefix. If the service uses a different binary or `-c`, `-p` options, account for these in the inspection commands as well. [Finding the configuration path](https://docs.nginx.com/nginx/admin-guide/basic-functionality/managing-configuration-files/#directives).

For the standard path, read the file:

```sh
sudo sed -n '1,200p' /etc/nginx/nginx.conf
```

This prints the first 200 lines. If the file is longer, continue reading by changing the range. The `--conf-path` value is the build-time default; service options can override it.

## 2. Understand the nesting

Settings are written as directives. A simple directive ends with `;`, a block contains directives inside braces, and `#` starts a comment that continues to the end of the line. A context is an area where a particular set of directives is allowed. [Nginx configuration structure](https://nginx.org/en/docs/beginners_guide.html#conf_structure).

A small example to read:

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    server {
        listen 127.0.0.1:8080;
        server_name localhost;

        location / {
            return 200 "configuration example\n";
        }
    }
}
```

| Context | Location | Purpose in the example |
| --- | --- | --- |
| `main` | Outside top-level blocks | General process settings: `worker_processes` |
| `events` | In `main`, alongside `http` | Connection processing: `worker_connections` |
| `http` | In `main` | HTTP settings and site blocks |
| `server` | In `http` | A virtual server with an address, port and names |
| `location` | In `server` | Rules for processing a request URI |

There is no `main` keyword or `main {}` block in the file: this is the name for the outer level. In this example, the path to request rules is `main → http → server → location`; `events` is a separate block.

Each directive's reference lists its allowed contexts in the `Context` field. For example, `listen` belongs in an HTTP `server` block, and `location` cannot simply be moved to the `http` level. Do not assume that all settings follow the same inheritance rules: these depend on the directive. [HTTP module reference](https://nginx.org/en/docs/http/ngx_http_core_module.html), [configuration inheritance](https://docs.nginx.com/nginx/admin-guide/basic-functionality/managing-configuration-files/#inheritance).

## 3. Trace include directives

The `include` directive loads a separate file or files matching a mask. For example, an existing `http` block may contain:

```nginx
include /etc/nginx/conf.d/*.conf;
```

Files included here are read in the `http` context. A site file can therefore contain `server { ... }` without an outer `http { ... }`. Adding another `http` wrapper would cause a context error. If an `include` is inside `server`, its fragment needs directives allowed at that level instead. [The include directive](https://nginx.org/en/docs/ngx_core_module.html#include).

For each inclusion, answer three questions: where is the `include`, which paths match it, and which blocks do those files contain? A directory name does not determine the context.

The `*.conf` mask includes `example.conf` but excludes `example.conf.disabled`. A backup named `example-backup.conf` also matches; keep such copies outside the included set. For an explicit inclusion of one file, check that the file exists.

## 4. Account for the package source

The installation article uses the official `nginx.org` repository. Its [packaged nginx.conf](https://github.com/nginx/pkg-oss/blob/master/debian/debian/nginx.conf) includes `/etc/nginx/conf.d/*.conf` inside `http`. Ubuntu/Debian packages may also use the `sites-available` and `sites-enabled` layout. [Ubuntu guide](https://ubuntu.com/server/docs/how-to/web-services/configure-nginx/), [Debian directory structure](https://wiki.debian.org/Nginx/DirectoryStructure).

| Path | How to interpret it |
| --- | --- |
| `/etc/nginx/nginx.conf` | The main file: general blocks and inclusions |
| `/etc/nginx/conf.d/*.conf` | Additional HTTP settings when the mask is included inside `http` |
| `/etc/nginx/sites-available/` | Stores site configurations in the Ubuntu/Debian layout; a file's presence does not mean it is included |
| `/etc/nginx/sites-enabled/` | Usually contains symbolic links to selected sites and is loaded by a separate `include` |
| `/etc/nginx/mime.types` | Maps file extensions to MIME types; it is not a separate site configuration |

Check the actual `nginx.conf`: a directory's presence on disk does not prove that it is included. Creating `sites-enabled` in an installation from `nginx.org` does not by itself include sites. With the `sites-enabled/*` mask, a file does not need a `.conf` extension to be read.

## 5. Inspect included files with nginx -T

```sh
sudo /usr/sbin/nginx -T
```

`-T` performs the same check as `-t` and also prints the main and included files. On success, the diagnostic messages include:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

File contents begin with markers such as:

```text
# configuration file /etc/nginx/nginx.conf:
# configuration file /etc/nginx/mime.types:
# configuration file /etc/nginx/conf.d/default.conf:
```

Only the markers are shown here: in the actual output, each is followed by that file's contents. The list depends on your package and settings. Find the `server` block and the nearest preceding marker to identify its source file. Then trace the `include` directives to determine its inclusion context.

`-T` reads the current files on disk. It does not retrieve the running master process's configuration from memory or apply changes: after an edit, its output may differ from the settings the service is still using. The output also retains `include` directives; it is a collection of marked files, rather than a single file ready to replace `nginx.conf`. [Command-line parameters](https://nginx.org/en/docs/switches.html), [output generation in the source code](https://github.com/nginx/nginx/blob/master/src/core/nginx.c).

The output may contain passwords and tokens written in directives. Remove those values before sharing excerpts with other people.

## Which file to edit

For general process settings, find the relevant directives in the main file. For a particular site, locate the file containing its `server` in the `-T` output. If it is included through a symbolic link in `sites-enabled`, check the link's target in `sites-available`.

Before editing, record the source path and make a backup outside the included masks. After an edit, check the configuration:

```sh
sudo /usr/sbin/nginx -t
```

The check does not apply changes. The procedure for having the running service reread its configuration is covered in [Reload and restart](./startup#reload-and-restart).

## Verify the result

The iteration is complete when you can:

1. Name the main file and explain whether service options override it.
2. Find the relevant `server` in a successful `nginx -T` output and name its source file.
3. Show the chain of `include` directives that reads this file inside `http`.
4. Explain which files match the mask in use and why a file outside it is not included.

## If something goes wrong

| Symptom | What to check |
| --- | --- |
| `directive is not allowed here` | The directive's context and the location of its `include`; check for an extra `http` wrapper around a file containing `server` |
| `unexpected "}"` or `unexpected end of file` | Matching braces and `;` before the reported line; the cause may be earlier in the file |
| `open() ... failed` | The path in the message, read permissions and the symbolic link target |
| A site file is missing from `-T` | The main file, inclusion chain, mask and file extension; first confirm that the check succeeded |
| The file appears in `-T`, but the service still behaves as before | Whether the check uses the same binary and options as the service, and whether changes were applied after editing |
| An error appears after adding a backup | Whether the copy matches `*.conf` or `sites-enabled/*`; the same settings may be included twice |

Start with the path and line number in the diagnostic message. When the check fails, do not treat the `-T` output as a complete list of included files.
