---
title: Git and repository hosting services
description: Learn how local Git differs from GitHub and GitLab, where commits live and how to read a repository page without installing software.
sidebarOrder: 20
prev:
  text: Why use version control?
  link: /en/tools/git/why-version-control
next: false
---

# Git and repository hosting services

You make a commit, but a colleague says, “I cannot see the changes.” Why does this happen if Git has already recorded the result?

**A commit records a state in a particular repository. For another participant to obtain that result, history must be transferred between repositories.** GitHub and GitLab provide a place to host repositories and tools for collaboration.

Allow **25–35 minutes** for the explanations and exercises. You will need the concepts of a working file, a commit and a repository from the [first lesson](./why-version-control). Bring a browser and a note for your answers; no Git installation or account creation is required yet.

After the lesson, you will be able to:

- distinguish Git, a server repository and the website used to work with it;
- explain where a new commit lives before and after it is sent;
- distinguish receiving history from updating working files;
- find files and commits in a public GitHub repository.

## 1. Git, GitHub and GitLab have different roles

**Git** is a version control system. It records commits, stores history and lets you compare versions. A local repository lives on your computer: you can use the history already there and create new commits without internet access.

**Repository hosting** provides a place for repositories that people can access over a network. In this lesson, a server is a computer that participants contact to exchange history.

**GitHub** and **GitLab** are platforms for hosting Git repositories. Besides storing history, they provide a web interface: file pages, discussions and tools for reviewing proposed changes.

| Item | Role | Example |
| --- | --- | --- |
| Git | Recording and processing version history | Create a commit in a local repository |
| Repository on a server | Storing the history transferred to it | Receive commits from one participant and provide them to another |
| GitHub or GitLab web interface | Browsing a project and collaborating in a browser | Open a change and read its discussion |

Git is not tied to one service: GitHub is one hosting option. In GitLab, a repository belongs to a **project**, which also contains settings and other tools. These roles are described in [GitHub Docs: About Git](https://docs.github.com/en/get-started/using-git/about-git) and [GitLab Docs: Repository](https://docs.gitlab.com/user/project/repository/).

<LessonCheck lang="en" question="Can you create commits in an existing local repository without a GitHub account or internet access?" :options="['No: every commit is created on GitHub', 'Yes: Git records them in the local repository', 'Only while the GitLab website is open']" :correct="1" explanation="Local commits require Git and a configured local repository. A service account is needed for the relevant actions on that service, not for local history itself to exist." />

## 2. A local repository, a remote repository and a browser page

Imagine Anna's website from the first lesson. Two people now work on it: Anna and Boris. Each has a working folder and a local repository.

They use a server repository to exchange their work:

```text
Anna's computer  ←→  Server repository  ←→  Boris's computer
```

From Anna's perspective, the server repository is a **remote repository**. You will also encounter the word **remote**. Strictly speaking, a remote repository can even be in another folder on the same computer; here we use the familiar server example. This distinction is explained in [Pro Git: Working with Remotes](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).

An open GitHub page shows data available **on the service**. It does not read Anna's working folder from her computer. Refreshing a browser page does not update Boris's local repository either.

It helps to identify where each action takes place:

| Action | Where to look for the result |
| --- | --- |
| Anna saves text in her editor | In her working file |
| Anna creates a local commit | In her local history |
| Anna successfully sends the commit to the server repository | In the selected branch's history on the server |
| Boris opens the project page in his browser | He sees the server version; his local files do not change |

A **branch** is a line of development in a project. For the examples below, assume everyone works with one branch called `main`, and Boris has no independent changes. We chose the name `main` for our example; another repository may use a different name.

## 3. Follow one commit's journey

Initially, Anna, Boris and the server all have the same history: `A → B`. The letters are example commit labels. In the table, a branch's state means its latest commit together with the preceding history.

Anna adds contact details and records them in commit C. She then sends C to the server. Later, Boris obtains the new history and incorporates it into his work.

| Step | Anna's branch | Server branch | Boris's branch and working files |
| --- | --- | --- | --- |
| 1. Initial state | `A → B` | `A → B` | `A → B`, files from B |
| 2. Anna creates C locally | `A → B → C` | `A → B` | `A → B`, files from B |
| 3. Anna successfully sends C | `A → B → C` | `A → B → C` | `A → B`, files from B |
| 4. Boris obtains the history and updates his branch to C | `A → B → C` | `A → B → C` | `A → B → C`, files from C |

After step 2, the commit exists, but only on Anna's computer. After step 3, it is visible on the server, but Boris's working files are still unchanged. Only after step 4 does Boris work with the new state.

The transfer succeeds in this example. In real work, a server can reject it, for example because of insufficient permissions. The outcome matters: attempting a transfer does not prove the server received the intended commit.

<LessonCheck lang="en" question="Anna creates C locally. The server and Boris still have only A and B. She refreshes GitHub but sends nothing. Where is C?" :options="['Only in Anna’s local repository', 'With every participant', 'On the server because the browser is open']" :correct="0" explanation="Refreshing a web page does not transfer local history. Until it is sent, C remains only on Anna's computer." />

### Why sending history does not include every file on a computer

After C, Anna edits the greeting again and saves the working file, but does not include that edit in a new commit. Sending C transfers the history containing C. The later text that exists only in the working file is not part of that commit.

Distinguish four results: **saved working file → local commit → commit on the server → another participant's updated work**.

<LessonCheck lang="en" question="After C, Anna saves a new phrase in home.md without another commit, then successfully sends C. What does the server receive?" :options="['Every file in the working folder, including the new phrase', 'History containing C; the new uncommitted phrase is not included', 'Only the filename home.md']" :correct="1" explanation="Transferring history sends commits. A phrase that exists only in the working file after C is not part of snapshot C." />

## 4. Cloning, pushing and receiving changes

Git explanations use four names for these actions. For now, understanding their purpose is enough; you do not need to run commands.

| Name | Purpose | Important distinction |
| --- | --- | --- |
| Clone | Create a local repository from an existing one | This is the initial step for obtaining your own working copy with history |
| Push | Send local commits and update the selected branch on the server | Uncommitted working changes are not sent by themselves |
| Fetch | Download available new data and update information about remote branches | Your current local branch and working files do not update automatically |
| Pull | Obtain changes and integrate them into the current branch | If you have your own changes, you may need to resolve a conflict |

A **conflict** occurs when changes cannot be combined automatically and a person needs to choose the final result. Boris has no independent edits in our table, so we consider a simple successful update.

After fetch alone, Boris's local repository may already contain C's data while his current branch and working files still match B. “Received new commits” and “Updated working files” therefore describe different results. This distinction is covered in [Pro Git: fetching and pushing changes](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).

<LessonCheck lang="en" question="Boris performs only fetch and receives C's data. His current branch was previously at B. What happens to the working files?" :options="['They must already match C', 'They stay unchanged: fetch does not update them by itself', 'They are deleted because the server has a new version']" :correct="1" explanation="Fetch obtains data in the local repository and updates information about remote history. It does not itself move the current branch to C or replace the working files." />

### Why Download ZIP does not replace cloning

GitHub lets you download source files through **Download ZIP**. The archive contains files from a selected state, but not the entire repository history. An ordinary clone creates a local Git repository with history; special cloning modes can limit the data retrieved.

An archive may be enough for reading files. To explore history and exchange commits, you need a local copy of the repository. See [GitHub's source archive documentation](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) and the [git clone manual](https://git-scm.com/docs/git-clone).

<LessonCheck lang="en" question="You downloaded the source through Download ZIP. What do you have?" :options="['A local Git repository with its entire history', 'An automatic connection to the team’s working folders', 'An archive of files from the selected state without the full Git history']" :correct="2" explanation="A ZIP provides a source snapshot. It does not replace cloning a repository for working with history and exchanging commits." />

## 5. What a repository page shows

The web interface lets you browse files and history without installing Git locally. We will use GitHub for this introduction; GitLab provides similar features with different names and layouts.

Learn to recognise these elements on a GitHub page:

| Element | What it shows |
| --- | --- |
| Owner and repository name | Which project is open, for example `git/git` |
| Selected branch | Which line of development you are viewing |
| Code and the file list | Files from the selected branch or another selected state |
| README | The project description, if such a file exists |
| Commits / history | Commit messages and links to their contents |
| Pull requests | Proposed changes that people can discuss and review |

A **pull request** proposes integrating changes from one branch into another. GitLab calls its similar tool a [**merge request**](https://docs.gitlab.com/user/project/merge_requests/). These are collaboration tools provided by the platform. Creating a local commit does not create such a proposal by itself.

The services also let you edit files in a browser. If you create a commit through your repository's web editor, it appears on the service. The local copy on your computer does not update by itself. The process is shown in [GitHub Docs: Editing files](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).

## 6. On a server, public and running as a website

A **public repository** is accessible to everyone on the internet. A **private repository** is accessible to people who have the relevant permissions. Being able to read a public project does not give every visitor permission to change it. Visibility and permissions are described in [GitHub Docs: About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories).

The word “publish” therefore needs clarification. When discussing the exchange of commits, we mean **sending history to a selected repository**. Access to that history depends on the repository's settings.

If the project is a website, hosting its source on GitHub does not mean the site is already built and available to visitors. That requires a separate deployment process. Deployment can be configured to run automatically after a push, but sending commits alone without that configuration is not enough. One option for a static site is [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

<LessonCheck lang="en" question="You sent a website's commits to a private repository without configuring deployment. Which result can you confirm?" :options="['History is in that repository and available to people with access', 'Everyone on the internet can now see the source', 'The finished website is already running for visitors']" :correct="0" explanation="The transfer sent history to the selected repository. Private visibility limits access; running the finished website requires separate deployment." />

## 7. Practice: locate the new version

Anna and Boris already work with state C. The server also has `A → B → C`. The project owner uses that server repository's web editor to create D, a correction to the description. Neither participant receives any updates from the server afterwards.

Answer these questions in your note before opening the explanation:

1. Where is D now: on the server, Anna's computer or Boris's computer?
2. Will Boris's local files change if he simply reads D in a browser?
3. After fetch alone, Boris has D's data. What else is needed to work with files from D?
4. Does Anna need to create the same D commit again to obtain the correction?

::: details Worked answer

1. D is on the server. Both local branches remain at C.
2. No. Viewing a page does not update local files.
3. He needs to incorporate the received change into his current branch. In our simple case without independent edits, that means updating it from C to D; the working files will then match D.
4. No. Anna needs to obtain the existing history and update her work. It is the same D commit that already exists on the server.

Check your result: distinguish where data is stored, the position of the current branch and the contents of the working files.

:::

## 8. Practice: read a public repository

Open [Git's GitHub repository — git/git](https://github.com/git/git). This is a public mirror of Git's own source code. Browsing the pages is enough for this exercise; you do not need to clone the project, download an archive or change files.

1. Find the owner and repository names: both are `git` in this case.
2. Find the **Public** label and the selected branch's name. Record the actual name: it does not have to be `main`.
3. In **Code**, find `README.md` in the file list and open it. It is enough to recognise that you are viewing a project file; understanding the source code is not required.
4. Return to the repository's main page. Open the commit-history link near the latest change: it may contain **Commits**, a commit count or a history icon.
5. Open a commit that contains file changes. Find its message, identifier and list of changed files.

On narrow screens, some elements appear in additional menus. If you cannot see the history link, use the [direct link to git/git history](https://github.com/git/git/commits). Messages and commit counts change over time; record the data you see now.

Fill in this short card:

```text
Service:
Owner / repository:
Visibility:
Selected branch:
Opened file:
One commit's message and identifier:
Whose history the browser shows:
Did viewing the pages create a local repository on my computer:
```

::: details How to check your card

- **Service:** GitHub.
- **Owner / repository:** `git/git`.
- **Visibility:** Public.
- **Branch:** matches the one selected in the interface.
- **File:** `README.md`.
- **Commit:** the recorded message and identifier belong to the same entry you opened.
- **History in the browser:** the history of the repository hosted on GitHub.
- **Local repository:** viewing a page alone does not create one.

The exercise is complete if you found a specific file and commit and can explain where the data you viewed is stored.

:::

## Lesson result

You have completed the lesson if you can, in your own words:

- explain what Git does and what GitHub or GitLab adds;
- follow C from Anna's computer to the server and Boris's working folder;
- explain why pushing does not transfer uncommitted text and fetch does not update working files by itself;
- distinguish a ZIP of files from a local Git repository with history;
- distinguish sending commits, public access and deploying a website;
- answer the six questions and find a file and commit in a public repository.

If the example becomes confusing, first name the place — Anna's computer, the server or Boris's computer — then clarify whether you mean history or working files.
