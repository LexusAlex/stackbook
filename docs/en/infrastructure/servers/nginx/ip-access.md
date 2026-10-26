---
title: Access by IP address
description: Check Nginx over HTTP locally and from another computer — server IP, port 80, UFW rules, cloud firewalls and connection troubleshooting.
sidebarOrder: 40
---

# Access by IP address

Open the Nginx welcome page using the server's IP address. Check the request path in stages: service, listening port, local HTTP, network rules and a request from another computer.

## Before you start

You need an Ubuntu or Debian server with Nginx installed and running, `sudo` access and a second computer for verification. Preparation is covered in [Installing Nginx](./installation) and [Startup and boot configuration](./startup).

The main example uses IPv4 and HTTP on TCP port `80`. For a check within a local network, the server's address on that network is sufficient; internet access requires an externally reachable address and a route to the server.

Run the commands in sections 1–4 on the server, and the external check in section 5 on another computer. If `curl` is missing on Ubuntu/Debian, install it:

```sh
sudo apt install curl
```

## 1. Check the service and port

```sh
systemctl is-active nginx.service
sudo ss -4 -ltnp 'sport = :80'
```

Look for `active` and a `LISTEN` entry for port `80` associated with an `nginx` process. The `ss` command from the `iproute2` package shows listening IPv4 TCP sockets; `-n` keeps addresses and ports numeric, while `-p` adds process information. [The ss manual](https://manpages.debian.org/trixie/iproute2/ss.8.en.html).

Read the `Local Address:Port` column:

| Address | Meaning |
| --- | --- |
| `0.0.0.0:80` | Accepts connections on all local IPv4 addresses |
| `127.0.0.1:80` | Accepts connections only through the server's own loopback interface |
| A specific IP with `:80` | Accepts connections only on that local address |
| No entries for port `80` | Nothing is listening on that port over IPv4; check the service, address and configured port |

Do not enter the `0.0.0.0` address from this output in your browser. Use the server's actual address for requests. If you need IPv6, check it separately with `sudo ss -6 -ltnp 'sport = :80'`: the presence of an IPv6 socket does not by itself confirm IPv4 access. [The listen directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#listen).

## 2. Check HTTP on the server itself

If Nginx listens on `0.0.0.0:80` or `127.0.0.1:80`, run:

```sh
curl --noproxy '*' --connect-timeout 5 --max-time 10 -i http://127.0.0.1/
```

If it listens only on a specific interface address, substitute that address for `127.0.0.1`.

`-i` prints headers along with the response body. `--noproxy '*'` bypasses any configured HTTP proxy, `--connect-timeout 5` limits connection establishment to five seconds, and `--max-time 10` limits the entire request to ten. [Curl options](https://curl.se/docs/manpage.html).

For an unchanged packaged site, expect a success status and the welcome page's HTML. The response may start like this:

```text
HTTP/1.1 200 OK
Server: nginx/...
Content-Type: text/html
```

Below the headers, look for the page's HTML, usually containing `Welcome to nginx!`. The server version and headers may differ. A `403`, `404` or redirect already confirms receipt of an HTTP response, but this iteration requires the welcome page to open successfully.

## 3. Choose an address for another computer

Inspect the server's network interface addresses:

```sh
ip -brief address show
```

Use an interface address reachable from the computer making the check. On every computer, `127.0.0.1` refers to that computer itself. [The ip address manual](https://manpages.debian.org/trixie/iproute2/ip-address.8.en.html).

| Request origin | Address to use |
| --- | --- |
| The same local network or a VPN | A server address with a route from that network |
| The internet, connecting to a cloud server | The public address from the provider's panel; with NAT it may not appear in `ip` output |
| The internet, connecting to a server behind a router | The router's public address with TCP port forwarding to the server configured |

Addresses in `10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16` belong to private networks and are not routed directly over the public internet. Access requires a local network, VPN or configured NAT. [Private addresses in RFC 1918](https://www.rfc-editor.org/rfc/rfc1918.html).

## 4. Check the firewalls

### On the server

If UFW manages the rules, inspect its state:

```sh
sudo ufw status verbose
```

If it reports `Status: active` and there is no suitable HTTP allowance, add a rule for incoming connections to port `80`:

```sh
sudo ufw allow 80/tcp
sudo ufw status numbered
```

Check the `80/tcp` allowance and the rule order: an earlier matching deny can override the added allowance. This rule allows HTTP from any address; if access is only needed from your network, specify that source in the rules. [Ubuntu firewall configuration](https://ubuntu.com/server/docs/how-to/security/firewalls/), [UFW syntax and rule ordering](https://manpages.ubuntu.com/manpages/noble/man8/ufw.8.html).

`Status: inactive` means UFW is not currently filtering traffic; adding a rule does not enable it. If you choose to enable UFW separately, first allow the actual SSH port and make sure you can recover access through the provider's console. Other rules, such as nftables rules, may be active; if UFW is not installed, check the filtering mechanism in use.

### At the provider or router

For a cloud server, check the external firewall or security group: incoming TCP port `80` must be allowed from the computer making the check, and the rule must apply to the correct server. These settings operate separately from UFW. [AWS security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) are one example of this model.

With NAT, check forwarding from external port `80` to the server's address and port `80`. If the public address is shared and the provider offers no incoming forwarding, a home-router rule alone is insufficient. Test the public address from another network: access from your own network depends on the router's NAT loopback support.

## 5. Open the page from another computer

Replace `192.0.2.10` in the following examples with the server's actual address. This address is used only for documentation.

On a Linux or macOS computer:

```sh
curl --noproxy '*' --connect-timeout 5 --max-time 10 -i http://192.0.2.10/
```

In Windows PowerShell, call `curl.exe` explicitly:

```powershell
curl.exe --noproxy '*' --connect-timeout 5 --max-time 10 -i http://192.0.2.10/
```

Then open `http://192.0.2.10/` in your browser, substituting your IP here as well. Specify `http://` explicitly: HTTPS requires separate configuration. To check access from the internet, use a computer on another network.

Expect `200 OK` with the welcome page's HTML and the page itself in your browser. A request to the public IP from the server itself does not replace an external check.

For a request by IP, the `Host` header contains that IP. If no `server_name` matches, Nginx selects the default server for the address and port: the one explicitly marked `default_server`, or the first matching block. The packaged welcome page therefore usually does not require adding the IP to `server_name`. [How Nginx selects a server](https://nginx.org/en/docs/http/request_processing.html).

## If Nginx only listens on loopback

Find the site's configuration using `sudo /usr/sbin/nginx -T`. For installations from `nginx.org`, this is often `/etc/nginx/conf.d/default.conf`; identify the actual file from the command's output. Inclusion structure is explained in [Configuration structure](./configuration).

If the site should accept external IPv4 connections, replace the restrictive `listen 127.0.0.1:80;` in its existing `server` block with:

```nginx
listen 80;
```

Preserve any other parameters of that directive, such as `default_server`. This line belongs in the existing site block. After saving the file, check and apply the changes:

```sh
sudo /usr/sbin/nginx -t && sudo systemctl reload nginx.service
```

For a nonstandard binary or startup options, use the same inspection options as the service. Then repeat `ss`, the local request and the external request.

## Verify the result

The iteration is complete when the service is active, Nginx listens on the required address and port, and another computer receives `200 OK` and displays the welcome page by IP. The local check confirms HTTP operation on the server; the external request additionally checks access over the chosen network path.

## If something goes wrong

| Symptom | What to check |
| --- | --- |
| The local request cannot connect | The service, `ss` output, address and port; if another process occupies the port, identify it |
| `Connection refused` | The IP and port, and whether a socket is listening; a firewall can also actively reject a connection |
| `Connection timed out` | Routing, UFW, the external firewall, the allowed source and NAT; a timeout alone does not identify a particular layer |
| It works locally but not from another computer | The listening address, reachability of the chosen IP, both firewall layers and port forwarding |
| The response is `403` or `404` | The selected `server`, welcome file path and permissions; the HTTP connection has already been established |
| Another site or a redirect appears | The default server for the address and port, `server_name` rules and that site's settings |
| The browser reports an HTTPS error but curl works | Whether the browser changes `http://` to `https://`; check the address bar and HTTPS mode |
| `ping` works but the page does not open | TCP port `80` and the HTTP response: ICMP does not check the web server; a missing ping reply does not prove HTTP is unreachable either |

For an HTTP error, check the `access_log` and `error_log` paths in `nginx -T` output. For startup problems, use the diagnostics in [Startup and boot configuration](./startup).
