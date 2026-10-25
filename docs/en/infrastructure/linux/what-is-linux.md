---
title: What is Linux?
description: Understand the roles of the Linux kernel, system programs and applications, and what a distribution brings together.
sidebarOrder: 10
prev:
  text: Linux
  link: /en/infrastructure/linux/
next: false
---

# What is Linux?

After this article, you will be able to explain what the Linux kernel does, why system programs are needed and what a distribution adds.

## Before you start

You need a browser and a note for your answers. The task is to identify the parts of a system and explain their roles using a web server as an example.

## 1. What the name Linux means

**Linux is an operating system kernel:** the core component through which running programs access a computer's resources.

In everyday conversation, “Linux” also refers to a whole system based on this kernel, such as an Ubuntu or Debian installation. “Install Linux” usually means installing one of these distributions. The [Debian FAQ](https://www.debian.org/doc/manuals/debian-faq/basic-defs) explains the distinction between the kernel and the system.

To understand a server, we will distinguish the kernel, system programs and applications.

## 2. What the kernel does

A web server, a database and other programs can run on a server at the same time. The kernel manages their shared resources:

- schedules processor time for running processes;
- manages memory;
- provides operations for working with files and network connections;
- communicates with devices through drivers.

For example, a program accesses a file through the operating system's facilities rather than controlling the disk itself. In a virtual machine, the kernel works with the virtual devices provided to that machine.

Multitasking, memory and networking support are described on the [About Linux Kernel page](https://www.kernel.org/linux.html).

## 3. Programs that work alongside the kernel

Everyday use requires tools for managing the system and applications that carry out user tasks.

| Part of the system | Examples | Role |
| --- | --- | --- |
| Kernel | Linux | Manages resources and provides access to them |
| System programs | Bash, systemd, APT | Run commands, manage services and install packages |
| Applications | Nginx, a text editor | Serve a website, edit documents and perform other tasks |
| Hardware | Processor, memory, disk | Provides computing resources and data storage |

You will meet several names from the table later:

- **Bash** is a shell: it interprets and executes commands. See the [Bash manual](https://www.gnu.org/software/bash/manual/html_node/What-is-Bash_003f.html).
- **systemd** manages the startup and operation of services. A service is a program that runs in the background, such as a web server. See the [systemd manual](https://freedesktop.org/software/systemd/man/latest/init.html).
- **APT** manages software packages in Debian and Ubuntu. A package contains a program or other components prepared for installation. See [APT in the Debian introduction](https://www.debian.org/intro/about).

Both system programs and applications use the kernel. The distinction helps explain their purpose: Bash handles commands, APT installs software and Nginx serves a website.

## 4. Example: serving a web page

Imagine a server running Nginx, configured to serve an HTML file:

1. A browser requests a page.
2. Nginx processes the request and determines which file is needed.
3. Nginx uses the kernel's facilities to read the file and send data over the network.
4. The browser receives the response and displays the page.

**Nginx determines the web server's response; the kernel provides access to files and networking.** Nginx's role as an HTTP server is described on the [project website](https://nginx.org/en/).

To serve a website, you install and configure a web server. That task by itself does not require replacing the kernel.

## 5. What a distribution adds

A **distribution** brings the kernel, system programs and other components together into a system you can install and update. The distribution project prepares packages, maintains their integration and provides tools for managing them.

Ubuntu and Debian are examples of distributions based on the Linux kernel. Their software selection, settings and component versions can differ. Additional applications are installed as needed.

A distribution is what we will install on the practice machine. The [Debian introduction](https://www.debian.org/intro/about) describes the roles of the kernel, basic tools and packages. Choosing a distribution and release is the next topic in the article plan.

## 6. Check your understanding

In your note, place these names into five groups: **kernel, system program, application, distribution, hardware**.

1. Linux, in the precise sense of the name.
2. Bash.
3. systemd.
4. APT.
5. Nginx.
6. Ubuntu.
7. SSD.

Then answer in your own words:

- What role does the kernel play when Nginx reads a file?
- Why do you choose a distribution when installing a system?
- Which part of the system does a text editor belong to?

Open the answers after making your own attempt.

::: details Answers and explanation

| Name | Group |
| --- | --- |
| Linux | Kernel |
| Bash | System program: shell |
| systemd | System program: service management |
| APT | System program: package management |
| Nginx | Application: web server |
| Ubuntu | Distribution |
| SSD | Hardware |

When reading a file, the kernel gives Nginx access through the filesystem and handles the necessary input and output operations. The web server determines which file is needed for the response.

A distribution combines the kernel with basic programs and installation and update tools. It provides a system prepared for use.

A text editor is an application. It carries out a user's task using the operating system's facilities.

:::

## Result

Hide the explanation and complete these three sentences:

- “The Linux kernel is responsible for…”
- “System programs are needed to…”
- “A distribution brings together…”

You have reached the goal if you can explain these roles and classify the examples correctly. If you confuse Bash with the kernel, return to the table: the shell handles commands, while the kernel manages computer resources.
