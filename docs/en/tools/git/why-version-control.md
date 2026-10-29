---
title: Why use version control?
description: Use a two-file example to understand what Git records, how a commit differs from saving in an editor, and how history helps fix a mistake.
sidebarOrder: 10
prev:
  text: Git
  link: /en/tools/git/
next: false
---

# Why use version control?

**In about 10–15 minutes, examine a small project's history, choose how to fix a mistake and check your understanding on this page.**

You need a browser and a note for the independent task. We will use a prepared example to understand version control; commands for creating repositories and commits are separate topics.

## 1. The problem we want to solve

Imagine you are building a small website. You write a greeting, change the heading and add contact details. Later, you notice a typo.

The current files show what the website contains now. To fix the mistake, you want to know:

- what the text said before;
- which change introduced the typo;
- how to bring back the good heading while keeping the new contact details.

**Version control** records a history of file states so that you can compare and restore them. Git is the version control system we will learn. You can track code, documentation and other project files. [Version control in Pro Git](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control).

## 2. Three concepts: snapshot, commit, repository

| Concept | Meaning |
| --- | --- |
| Snapshot | A recorded state of the project's tracked files |
| Commit | A history entry linked to a snapshot, with an identifier, author and message |
| Repository | Storage for the project's history and supporting data |

**A commit records the prepared state of a project.** You choose which changes to include in that state and record it in history. Unchanged files remain part of the snapshot in their previous form. [The snapshot model in Pro Git](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F).

The message helps explain the change. “Add contact details to the home page” is more useful than “Change files”: it tells the reader what you intended to achieve.

## 3. Examine a two-file history

The example project contains two files:

```text
README.md — site description and contact details
home.md   — home-page text
```

Both files are tracked. Suppose their states were deliberately recorded in three commits. **A, B and C are labels** used for this example.

| Commit and purpose | README.md | home.md |
| --- | --- | --- |
| A — create a draft | Short site description | Hello |
| B — improve the greeting | Short site description | Welcome |
| C — add contacts and change the text | Site description and contact details | Welocme |

Snapshot B contains the state of both files: the new greeting and the previous description. C adds contact details and introduces a typo in the greeting. Git records that state too: the existence of a commit does not prove that its contents are correct.

Comparing B and C reveals two separate edits. The task is to fix the greeting and keep the contact details. Use the text of `home.md` from B while leaving `README.md` in its C state.

You can record the result as a new commit D, “Fix the greeting”. The history then contains the original change and its correction. File-restoration commands will have their own practical lessons.

<LessonCheck lang="en" question="How can you fix the typo and keep the new contact details?" :options="['Restore the whole project to B', 'Take home.md from B and keep README.md from C', 'Delete README.md']" :correct="1" explanation="B has the correct greeting, while C has the new contact details. Restore only the home.md text and keep the current site description." />

## 4. Saving a file and making a commit are separate actions

When you press **Save** in an editor, you change the working file on disk. To record a prepared version in Git history, you create a commit.

Suppose you edit the greeting three more times after B and save the file each time. Without new commits, those three intermediate states do not become three separate versions in Git history. The working file contains the last saved text, while B continues to describe its earlier snapshot.

It helps to record meaningful completed results: create the page structure, add contact details, fix an error. Preparing changes and making a commit are explicit steps described in [Pro Git](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository).

<LessonCheck lang="en" question="After B, you edit and save a file without making a new commit. Where are your edits?" :options="['In the current working file', 'In a new commit', 'In place of the contents of the existing commit B']" :correct="0" explanation="The editor saved the working file. A new commit is needed to record the prepared change in history; editing a file does not change the existing B commit." />

## 5. History starts on your computer

Commits are created in a **local repository**. Recording a commit and viewing history already available locally work without an internet connection.

Sending commits to another repository is a separate action. It lets people exchange history. Creating your own local commit does not yet mean a colleague has received your changes. [Local Git operations](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F).

<LessonCheck lang="en" question="Where can you create a commit without an internet connection?" :options="['Only on a server', 'In an ordinary file without a repository', 'In a local Git repository']" :correct="2" explanation="Git records the commit in the local repository. Passing that commit to another participant requires a separate exchange with another repository." />

## 6. Apply the idea to your project

Choose a small project you know: a website, a set of notes or a practice program. Fill in these four lines in your note:

```text
My project:
The first completed result worth recording:
The next change worth recording separately:
A file I would like to compare with its previous version:
```

Name specific results, such as “Add a contact section”. “Save everything” does not explain what changed.

::: details Example response

- **My project:** a personal website.
- **First result:** create a home page with my name and a short description.
- **Next change:** add contact details.
- **File to compare:** the home-page text, to see the greeting before it was edited.

This is one possible answer. For your own project, choose meaningful points to record and explain why the history will be useful.

:::

## Lesson result

You have completed the lesson if you:

- distinguish a working file from a state recorded in a commit;
- can use the table to choose an earlier version of one file while keeping useful edits in another;
- understand that a local commit and sending changes to another participant are separate actions;
- have chosen at least two meaningful points to record in your project.

If a question is difficult, open the hint, return to the example and then try answering again.
