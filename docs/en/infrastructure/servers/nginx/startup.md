---
title: Startup and boot configuration
description: Manage Nginx with systemd on Ubuntu and Debian — start the service, enable startup at boot, verify after a reboot and diagnose failures.
sidebarOrder: 30
---

# Startup and boot configuration

Start Nginx through systemd and configure it to start when the OS boots. Check two independent results: the service runs now, and startup at boot is enabled.

## Before you start

You need an Ubuntu or Debian server with systemd, an installed Nginx package and `sudo` access. Package verification is covered in [Installing Nginx](./installation).

Use the packaged `nginx.service`. A separate `sudo nginx` invocation bypasses service management; avoid mixing that process with systemd startup.

## 1. Find the service

```sh
systemctl cat nginx.service --no-pager
```

This displays the unit file and its drop-ins. `[Service]` describes startup, shutdown and reload commands; `[Install]` defines how the unit joins system startup. Do not create a second unit if the package already provides one. See [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) and [systemd.unit](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html) for the format.

## 2. Check configuration and start Nginx

```sh
sudo /usr/sbin/nginx -t && sudo systemctl start nginx.service
```

`&&` allows startup only after a successful configuration check. `nginx -t` does not start the server; it checks syntax and whether referenced files can be opened. See the [Nginx parameters](https://nginx.org/en/docs/switches.html).

Inspect the state:

```sh
LC_ALL=C systemctl status nginx.service --no-pager --full
systemctl is-active nginx.service
```

Expect `Active: active (running)` in `status` and `active` from `is-active`. `Main PID` and the process tree help identify this service's processes. `LC_ALL=C` makes status labels use English.

If the service already runs, `start` does not restart it. See [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) for startup and state checks.

### What happens during startup

1. **systemd prepares the service.** It uses the loaded unit settings and dependencies, runs `ExecStartPre` if configured, then `ExecStart`. An additional unit-level configuration check depends on the package; the command above explicitly runs `nginx -t`.
2. **Nginx prepares its environment.** It reads `nginx.conf` and included files, prepares logs and listening sockets. Configuration, file access or port-opening errors can prevent startup.
3. **Master and worker processes appear.** The master manages configuration and workers. Workers accept connections and process requests; `worker_processes` controls their number.
4. **systemd tracks the service.** `Type` determines when startup is considered complete. For example, with `Type=forking`, systemd waits for the initial process to exit and identifies the main process, usually through `PIDFile`.

Process roles are described in the [Nginx guide](https://nginx.org/en/docs/beginners_guide.html), and unit stages in [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html).

A simplified diagram for normal master-process operation:

```text
systemctl start
      |
   systemd -- ExecStart --> Nginx master
                              |-- worker
                              `-- worker
```

Inspect your own service's settings:

```sh
systemctl show nginx.service -p Type -p PIDFile -p ExecStart -p ExecReload -p ExecStop -p KillSignal -p TimeoutStopUSec
```

If `ExecStart` uses another executable or `-c` with a custom configuration, verification commands must use the same paths. `active` describes service state under the unit's rules, not an HTTP test of the website.

## 3. Enable startup at boot

```sh
sudo systemctl enable nginx.service
systemctl is-enabled nginx.service
```

Expect `enabled`. Persistent enablement uses the unit's `[Install]` section and survives OS reboots. `enabled-runtime` lasts only until reboot and does not meet this goal. See the [unit installation settings](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html#%5BInstall%5D%20Section%20Options).

**`start` and `enable` serve different purposes:** the former starts the service now, while the latter connects it to system startup. Plain `enable` does not start a stopped service.

An alternative to separate `start` and `enable`, after checking configuration:

```sh
sudo systemctl enable --now nginx.service
```

Check both states:

```sh
systemctl is-active nginx.service
systemctl is-enabled nginx.service
```

Expect `active` and `enabled`, respectively. See [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) for `--now` behavior.

Boot enablement and crash recovery are also separate. `enabled` connects the service to OS startup; whether systemd restarts Nginx after a crash depends on the unit's separate `Restart` setting. See the [service restart policy](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html#Restart=).

## 4. Verify startup after a reboot

Run this check when a server interruption is acceptable. A reboot ends current processes and disconnects your SSH session:

```sh
sudo systemctl reboot
```

Wait for the server to boot and reconnect over SSH. Run:

```sh
systemctl is-enabled nginx.service
systemctl is-active nginx.service
sudo journalctl -b -u nginx.service -n 30 --no-pager
```

Expect `enabled`, `active`, and successful startup messages from the current boot. For `journalctl`, `-b` selects the current boot, `-u` the service, and `-n 30` the latest 30 entries. See the [journal options](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

`enabled` alone is insufficient: a startup attempt can fail. An active service also does not establish external HTTP availability, which depends on configuration and networking.

### What happens when the server reboots

An OS reboot is a separate operation affecting every service:

1. systemd stops services according to their shutdown rules. Server connections, including SSH and Nginx connections, do not survive a reboot.
2. After the kernel and filesystems start, systemd builds service startup dependencies. Nginx boot enablement connects its unit to the relevant target; dependencies determine the actual order.
3. Nginx starts afresh with new processes, reading configuration and using the executable from disk. Processes and connections from the previous boot are not resumed.

Checking the journal with `-b` therefore verifies events from the new boot, rather than a successful start before the reboot. See [bootup](https://www.freedesktop.org/software/systemd/man/latest/bootup.html) for the overall sequence.

## Stop the service and disable startup

| Command | Effect |
| --- | --- |
| `sudo systemctl stop nginx.service` | Stop now, keeping the boot enablement setting |
| `sudo systemctl disable nginx.service` | Disable startup at boot, leaving a running service active |
| `sudo systemctl disable --now nginx.service` | Disable startup at boot and stop the service |

These are different actions. Disabling does not block manual starts or activation through another service's dependency. This distinction is also documented by [Ubuntu](https://documentation.ubuntu.com/security/common-mistakes/unnecessarily-open-ports/).

## Reload and restart

### Comparison at a glance

This comparison assumes a normal packaged Nginx service with a master process and the standard reload handler:

| What changes | `reload` | `restart` |
| --- | --- | --- |
| Master process | Keeps running with the same PID | Exits; a successful start creates a new one |
| Worker processes | New workers start while old workers finish their current work | Old workers stop before new ones are created |
| Client service | Designed for a graceful configuration change | Connections may break and request acceptance may pause |
| Configuration application fails | The master retains the previous working configuration | A failed new start can leave the service stopped |
| Updated Nginx executable | The running master is not replaced | The new start uses the executable from disk |
| Inactive service | Does not start it | Starts it if checks and startup succeed |
| Boot enablement | Unchanged | Unchanged |

Reloading is described in the [Nginx guide](https://nginx.org/en/docs/beginners_guide.html#control), and service operations in [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html).

### What happens during reload

```sh
sudo /usr/sbin/nginx -t && sudo systemctl reload nginx.service
```

1. systemd invokes `ExecReload`. In a normal Nginx service, it sends the master a `HUP` signal to request a configuration reload.
2. The running master reads configuration and attempts to prepare the required resources, including new logs and listening sockets.
3. On success, it starts new workers. Old workers stop accepting new connections and finish serving existing clients.
4. If the new configuration cannot be applied, the master continues with the previous configuration and processes.

This Nginx behavior is documented in [Controlling nginx](https://nginx.org/en/docs/control.html#reconfiguration). Check your unit for the actual signal-sending command.

An illustration; letters represent PIDs, not actual process numbers:

```text
Before reload:  master A --> workers B, C  (previous rules)

After reload:   master A --> workers D, E  (new rules)
                        --> workers B, C  (finishing current requests)
```

A request is not migrated from an old worker to a new one. Worker generations using different configurations can therefore coexist temporarily.

Long requests and connections, such as WebSockets, can delay old workers' exit. If `worker_shutdown_timeout` is configured, Nginx attempts to close remaining connections when it expires. A reload therefore does not unconditionally guarantee every connection's survival. See the [worker shutdown timeout](https://nginx.org/en/docs/ngx_core_module.html#worker_shutdown_timeout).

### What happens during restart

```sh
sudo /usr/sbin/nginx -t && sudo systemctl restart nginx.service
```

systemd stops the service and then starts it again. Shutdown behavior depends on `ExecStop`, signals, `KillMode` and the stop timeout. Nginx distinguishes graceful `QUIT` from fast `TERM`; a `systemctl restart` is not unconditionally graceful. When the stop deadline expires, systemd may terminate processes forcibly. See [systemd shutdown rules](https://www.freedesktop.org/software/systemd/man/latest/systemd.kill.html) and [Nginx signals](https://docs.nginx.com/nginx/admin-guide/basic-functionality/runtime-control/#control-nginx-with-signals).

After shutdown, a new master and new workers are created. Existing connections are not transferred to them; service can be interrupted during the change. If startup fails, the previous master can no longer continue. A preliminary `nginx -t` reduces risk but cannot guarantee successful startup under changed conditions.

### Which command to choose

| Change or task | Action |
| --- | --- |
| Ordinary changes to `nginx.conf` or included files | Check configuration, then `reload` |
| Start an inactive service | Use `start` after checking configuration |
| Run a replaced Nginx executable | Use a normal service restart; reload does not replace the running master |
| Change the unit or a drop-in, such as `ExecStart` | Run `daemon-reload`, then restart to launch with the new settings |

Nginx has a separate [live binary upgrade procedure](https://nginx.org/en/docs/control.html#upgrade). It is not equivalent to a normal `reload`.

After changing the unit, use this sequence:

```sh
sudo systemctl daemon-reload
sudo /usr/sbin/nginx -t && sudo systemctl restart nginx.service
```

`daemon-reload` rereads unit files and dependencies for systemd. It does not itself restart Nginx or apply `nginx.conf`. See [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html).

### How to observe the result

Run these commands before and after the chosen operation on a learning server:

```sh
systemctl show nginx.service -p MainPID --value
ps -C nginx -o pid,ppid,args
```

A normal reload preserves the main PID while worker PIDs change; old workers may still appear as shutting down. A successful restart creates a new master. See the [NGINX documentation](https://docs.nginx.com/nginx/admin-guide/basic-functionality/runtime-control/#master-and-worker-processes) for master and worker roles.

If `ExecReload` only sends a signal, successful command completion does not prove Nginx has already applied the settings: signal handling is asynchronous. Check the journal, configured `error_log` and the changed site's behavior. For the default log path:

```sh
sudo journalctl -u nginx.service --since '-5 minutes' --no-pager
sudo tail -n 50 /var/log/nginx/error.log
```

The limitations of asynchronous `ExecReload` are documented in [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html#ExecReload=). The absence of new errors does not by itself prove the expected HTTP response: verify the specific behavior the configuration change was intended to produce.

## If the service fails to start

Start with detailed status, the current boot's journal and a configuration check:

```sh
LC_ALL=C systemctl status nginx.service --no-pager --full
sudo journalctl -b -u nginx.service -n 50 --no-pager
sudo /usr/sbin/nginx -t
```

`status` and `is-active` return a nonzero exit code for an inactive service. This is the check result, not a command syntax error.

| Message or state | What to check |
| --- | --- |
| `Unit nginx.service could not be found` | Whether the package is installed on this server and contains the unit file |
| `failed` or a startup error | The first meaningful journal error; fix its cause before retrying startup |
| Invalid configuration or a missing file | The path and line from `nginx -t`, file existence and access permissions |
| `Address already in use` | Which process owns the required port; `sudo ss -ltnp` lists listening TCP sockets |
| `masked` | Why startup was explicitly blocked; plain `enable` does not remove the mask |
| `System has not been booted with systemd` | Whether systemd manages this system; these commands do not apply to another service manager |

After correcting the cause, retry startup and both checks: `is-active` and `is-enabled`. Expand the journal output if necessary: the latest 50 lines may not include the initial error.
