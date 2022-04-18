# git-branch-delete

Interactive command line tool that makes it comfortable to delete several local Git branches at once.

Demo:

![Demo](https://raw.githubusercontent.com/stefanwille/git-branch-delete/master/demo.gif "Demo")

## Installation

```bash
npm i -g git-branch-delete
```

## Usage

```bash
git-branch-delete
```

or

```bash
git branch-delete
```

This starts a command line UI that helps you select and delete local Git branches.

After the UI has launched, you can use the up and down arrows to change the selected branch. The spacebar can be used to add the branch to the set of to-be-deleted branches. Pressing enter will finalize the selection of branches to delete.
