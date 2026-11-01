---
title: Why use version control?
description: A detailed introduction to Git through a small website's history — working files, snapshots, commits, version comparisons and fixing a mistake while keeping useful changes.
sidebarOrder: 10
prev:
  text: Git
  link: /en/tools/git/
next: false
---

# Why use version control?

You change some text on a website, add contact details and realise that the old greeting was better. How do you bring it back while keeping the new contacts? What if you no longer remember the original text?

**Git helps you keep a project's history, compare recorded versions and recover the content you need.** In this lesson, we will explore how that history works and why it helps even when you work alone.

Allow **25–35 minutes** for the lesson and exercises. You need a browser and a note for your answers; no Git installation or commands are required yet.

After the lesson, you will be able to:

- explain the difference between a project's current files and its history;
- distinguish a snapshot, a commit and a repository;
- find the change that introduced a mistake in an example and suggest a correction;
- choose meaningful results to record as separate commits.

## 1. Why saving a file may not be enough

Imagine you are making a personal website. On Monday you write a greeting, on Tuesday you improve it, and on Wednesday you add contact details. After another edit, you notice a typo.

The **Save** button writes the current text to a file on disk. If that file is all you have, it is difficult to tell what earlier versions said and why you changed them.

One familiar precaution is to make copies:

```text
site/
site-copy/
site-final/
site-final-fixed/
```

At first, this helps. But questions soon arise: which version is really the latest, which folder has the new contacts, and exactly what changed between two copies? The name `final` does not tell you.

**Version control** lets you record selected file states and refer to them later. Git is a program for version control. It helps answer “What changed?”, “When?” and “Who recorded the change?”. A clear message can also help explain the reason for a change. Comparison and recovery are described in [Pro Git: About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control).

History helps even when you work alone: a week later, you may have forgotten your own decision. In a team, it also helps you understand another person's work.

## 2. What makes up a project's history

Start with four terms that will appear throughout the course.

### Working files

These are the files you currently open and edit, such as the home-page text and the site description. Their current contents may differ from the last state recorded in history.

The folder containing these files is called the **working directory**. Think of it as a desk holding your current work.

### Snapshot

A **snapshot** describes the state of the files included in a project version. It lets you find out what each of those files contained at a particular recorded point.

For example, a snapshot contains the correct greeting and a description without contact details. The working files may change later, while the recorded snapshot continues to describe that earlier version.

### Commit

A **commit** is a history entry that refers to a project snapshot. It has an identifier, author and time information, a message, and a connection to the preceding history. The first commit starts the history; in our simple example, each subsequent commit continues from the previous one.

A message such as “Add contact details” explains the purpose of the recorded result. The identifier lets you refer to a particular commit even if two entries have the same message.

### Repository

A **repository** stores snapshots, commits and other Git data. In an ordinary local project, this data lives in a hidden `.git` directory alongside the working files:

```text
site/
├── .git/       ← Git history and supporting data
├── README.md   ← working file with the site description
└── home.md     ← working file with the home-page text
```

Here, `README.md` and `home.md` are ordinary text files. The `.md` extension means Markdown; reading them as plain text is enough for this example.

The concepts fit together like this: **you edit working files, choose a state to record and create a commit; the repository stores that history**. The snapshot model and working directory are described in [Pro Git: What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F).

## 3. Read a two-file history

Assume that both files are already tracked: Git knows about them, and their contents are included in recorded versions. Each state described below has been explicitly recorded in a commit. **A, B and C are labels for this lesson**, rather than real Git identifiers.

### Commit A: create the site structure

`README.md` contains:

```text
Anna's website. Here I share my projects.
```

`home.md` contains:

```text
Hello!
```

We have recorded the first result: the basic website. We now have a point against which to compare later work.

### Commit B: improve the greeting

We replace the text in `home.md` with `Welcome!`, leave the description in `README.md` unchanged and record the result in commit B.

**Snapshot B describes both files**, even though only one changed. It contains the new greeting and the previous description. The unchanged file remains part of the project state; in Git's model, its previously recorded content is reused.

### Commit C: add contacts and change the greeting

We add the line `Contact: anna@example.com` to `README.md`. At the same time, we accidentally swap letters in `home.md`, producing `Welocme!`. We then include both edits in commit C.

Here is the history in a table:

| Commit and message | README.md | home.md |
| --- | --- | --- |
| A — “Create the site structure” | Site description | `Hello!` |
| B — “Improve the greeting” | Previous site description | `Welcome!` |
| C — “Add contacts and change the greeting” | Site description and contacts | `Welocme!` |

Each row shows the complete state of the two files. Read the history in order: first the basic site appeared, then the greeting improved, then contacts were added and a mistake appeared.

<LessonCheck lang="en" question="What does snapshot B contain if only home.md changed when it was created?" :options="['Only the new greeting', 'Both files: the new greeting and the previous description', 'Only a list of changed filenames']" :correct="1" explanation="The snapshot describes the state of all files included in it. README.md did not change, but its previous contents remain part of version B." />

## 4. Find the mistake and keep useful work

Suppose the working files now match C. You can see the typo, but want to keep the contact details you added.

Start by **comparing B and C**. A comparison, called a **diff**, shows the differences between selected states. Here is a simplified example: a line marked `-` was present in B, and a line marked `+` was added in C. These lines illustrate changes; they are not commands to run.

```diff
 README.md
 Anna's website. Here I share my projects.
+Contact: anna@example.com

 home.md
-Welcome!
+Welocme!
```

We can now explain what happened:

1. Useful contact details were added to `README.md`.
2. In `home.md`, the correct greeting was replaced with a misspelled version.
3. To fix the problem, we need to correct the greeting and keep the contacts.

Restoring the **whole project** to B would also remove the new contacts from the working files. That result would not meet our goal.

A suitable correction is to take the correct `home.md` text from B while keeping `README.md` from C. In this example, you could also fix the typo by hand: what matters is getting the contents of both files right. Then record the result as a new commit D, “Fix the typo in the greeting”.

```text
A → B → C → D
            ↑
     new correction
```

In snapshot D, the greeting is correct and the contacts are still present. History retains both C with the mistake and D with its correction. Fixing the current files this way does not require deleting the earlier commit.

<LessonCheck lang="en" question="How can you fix the typo and keep the new contact details?" :options="['Restore the whole project to B', 'Take home.md from B and keep README.md from C', 'Delete README.md']" :correct="1" explanation="B has the correct greeting, while C has the new contact details. Restore only the home.md text and keep the current site description." />

## 5. Save, stage and commit

It helps to distinguish three actions in Git. We will explain their meaning without commands:

| Action | Result |
| --- | --- |
| Save a file in the editor | The new content is written to the working file on disk |
| Stage changes | Content is selected for the next commit; this preparation area is called the index or staging area |
| Create a commit | The prepared state is recorded in local history |

Imagine editing the greeting three times after B and pressing Save each time. **Three saves in an editor do not create three commits by themselves.** The working file contains the last saved version, while B continues to describe its earlier state.

Staging gives you control over the contents of the next commit. For example, you can stage the addition of contacts and leave the unfinished home-page text for another task. The snapshot will contain the selected state, so it helps to review the staged changes before committing. This cycle is described in [Pro Git: Recording Changes to the Repository](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository).

<LessonCheck lang="en" question="After B, you edit and save a file without making a new commit. Where are your edits?" :options="['In the current working file', 'In a new commit', 'In place of the contents of the existing commit B']" :correct="0" explanation="The editor saved the working file. A new commit is needed to record the prepared change in history; editing a file does not change the existing B commit." />

### Choosing when to commit

A useful guide is a small result you can explain in one sentence and check. Examples include “Add contact details”, “Fix a typo” and “Clarify the project description”.

Our C mixed two edits. If adding contacts and changing the greeting had been recorded separately, the history would be easier to understand. Each message would describe one task whose result would be easier to assess.

| Message | What a reader learns from the history |
| --- | --- |
| “Changes” | They need to examine the contents to understand the result |
| “Add a contact address” | The project now includes contact details |
| “Fix the typo in the greeting” | The change corrects the home-page text |

The number of commits alone does not make history useful. The recorded steps need to have a clear purpose.

<LessonCheck lang="en" question="You have added contacts and are separately rewriting an unfinished greeting. What would be useful to record now?" :options="['Mix everything in a commit called Miscellaneous', 'Make a separate commit for each keystroke', 'The finished contacts in a separate commit with a clear message']" :correct="2" explanation="Adding contacts is a completed task. You can stage and record it separately, then continue working on the greeting later." />

## 6. Where history lives and how GitHub fits in

**Local** means “on your computer”. You can create a commit, view history already available locally and compare local versions without an internet connection.

To exchange work, you use another repository, such as one hosted on a server. **GitHub** is a service for hosting Git repositories and discussing project work. Git creates and handles history, while GitHub provides a place to host it and tools for collaboration. This distinction is explained in [GitHub Docs: About Git](https://docs.github.com/en/get-started/using-git/about-git).

Imagine the server still has A and B, while you have created C:

```text
Your computer:     A → B → C
Server repository: A → B
```

Creating local commit C does not send it to the server by itself. After a separate successful transfer of the relevant history, both sides can have A, B and C. Another participant must also contact the server to obtain that history on their computer.

It therefore helps to ask two different questions: “Have I recorded the result in my history?” and “Have I sent it to the place where others can obtain it?”

<LessonCheck lang="en" question="The server has A and B. You create C locally while offline and send nothing. What is on the server?" :options="['A, B and C: commits are sent automatically', 'Only A and B', 'Nothing: history disappears without internet access']" :correct="1" explanation="Local commit C already exists on your computer. The server repository remains at B until you separately send your changes there." />

## 7. What you should not expect from Git

History helps when you understand which state you actually recorded. Consider three common expectations.

**“Git will automatically remember every version I type.”** In the ordinary workflow, you record history through commits. If you rewrite a working file several times without committing, Git does not promise to recover every intermediate text. Your editor may have its own history, but that is a separate mechanism.

**“Every new file is already in history.”** Merely creating a file in the folder is not enough. A new file must be added to tracking and its contents recorded in a commit. In our example, we explicitly assumed both files were already tracked.

**“If there is a commit, its contents must be correct.”** Commit C shows otherwise: Git recorded useful contacts and a typo. A person or separate project checks must verify the result.

History stored on a single disk can also be lost along with that disk. Keeping data safe requires separate copies; sending commits to another repository preserves the transferred history there, but does not automatically copy all your local files and uncommitted edits.

<LessonCheck lang="en" question="You create notes.md but never include it in a commit. Can you rely on commit history to restore its text?" :options="['No: that text is not in the recorded snapshots yet', 'Yes: every file in the folder automatically enters history', 'Yes: saving it in the editor is enough']" :correct="0" explanation="Commit history contains recorded snapshots. To rely on that history for restoring a new file, you first need to include its contents in a commit." />

## 8. Practice: explain the correction

Return to the table of A, B and C. Answer these questions in your note before opening the explanation:

1. Between which two commits did the typo appear?
2. Why does restoring the complete B state fail to meet our goal?
3. What should each of the two files contain after the correction?
4. What message would you give the new commit D?

::: details Worked answer

1. The typo appeared between B and C: B has the correct greeting, while C has the swapped letters.
2. B has no contacts yet. Restoring that complete state would remove them from the working files along with the typo.
3. `home.md` should contain `Welcome!`; `README.md` should contain the site description and the line `Contact: anna@example.com`.
4. “Fix the typo in the greeting” works. The message explains the result that distinguishes D from C.

A correct answer preserves both useful parts: the corrected greeting and the current contacts. Your wording can differ from the example.

:::

## 9. Practice: plan your own project's history

Choose a small project you know: a website, a practice program or a collection of notes. Think of two successive results and one possible mistake.

Fill in the template:

```text
My project:
The files it will contain:
First completed result and commit message:
Next separate result and commit message:
A mistake I might make:
The earlier version I would compare the file with:
Useful changes I need to keep when fixing the mistake:
```

::: details Example response

- **Project:** English-learning notes.
- **Files:** `words.md` for vocabulary and `schedule.md` for a study timetable.
- **First result:** add five words with translations; message “Add the first five words”.
- **Next result:** create a timetable; message “Add the study timetable”.
- **Mistake:** write an incorrect translation for one word during a later edit.
- **Comparison:** compare the current `words.md` with a snapshot in which the translation was correct.
- **What to keep:** the new timetable in `schedule.md` and the other correctly translated words.

Here, history serves a specific purpose: correcting a translation while keeping other useful work.

:::

Check your answer: each message explains what was done; the two results belong to separate tasks; the correction names a specific file and states what must be kept.

## Lesson result

You have completed the lesson if you can, in your own words:

- explain why history helps even when one person works on a project;
- distinguish working files, a snapshot, a commit and a repository;
- explain why the unchanged `README.md` is part of snapshot B;
- suggest a correction to C that keeps the contacts;
- distinguish saving a file, staging changes, committing and sending history;
- name two completed results for your project and answer the six questions on the page.

If you cannot answer a question, open its hint, return to the relevant example and explain the solution again without the hint.
