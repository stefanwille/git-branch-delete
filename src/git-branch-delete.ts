#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const enquirer = require("enquirer");
const colors = require("ansi-colors");
const _ = require("lodash");


interface GitBranch {
  name: string;
  lastCommitRelative: string;
  lastCommit: string;
}

const isGitRepository = (): boolean => {
  let dir = process.cwd();
  for (;;) {
    const gitDir = path.resolve(dir, ".git");
    if (fs.existsSync(gitDir)) {
      return true;
    }
    if (dir === "/") {
      return false;
    }
    dir = path.resolve(dir, "..");
  }
};

const getGitBranches = (): GitBranch[] => {
  const cmd =
    "git for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD):%(refname:short):::%(committerdate:relative):::%(committerdate:iso8601)'";
  const text = child_process.execSync(cmd, { encoding: "utf-8" });
  const lines: string[] = text.replace(/'/ig,'').split("\n");
  const linesWithoutCurrentBranch = lines.filter(
    (line) => !line.startsWith("*:")
  );
  const branches: GitBranch[] = linesWithoutCurrentBranch.map((line) => {
    const [name, lastCommitRelative, lastCommit] = line
      .substring(2)
      .split(":::");
    return { name, lastCommit, lastCommitRelative };
  });
  const filteredBranches = branches.filter((branch) => branch.name !== "");
  return filteredBranches;
};

const selectBranchNames = async (branches: GitBranch[]): Promise<string[]> => {
  const sortedBranches: GitBranch[] = _.sortBy(branches, "name");
  const choices = sortedBranches.map((branch) => ({
    name: branch.name,
    message: `${branch.name} (${branch.lastCommitRelative})`,
    value: branch.name,
  }));
  const response = await enquirer.prompt({
    type: "multiselect",
    name: "branchNames",
    message: "Which branches do you want to delete?",
    choices,
  });

  //=> { branchNames: true }

  const selectedBranchNames = response.branchNames;
  return selectedBranchNames;
};

const askForConfirmation = async (
  branchesToDelete: string[]
): Promise<boolean> => {
  console.log(
    colors.red.bold.underline("You have selected these branches to delete:")
  );
  console.log(
    branchesToDelete
      .map((branchName, index) => ` ${index + 1}. ${branchName}`)
      .join("\n")
  );
  const response = await enquirer.prompt({
    type: "input",
    name: "confirmation",
    message: `Delete these ${
      branchesToDelete.length
    } branches? Type ${colors.green("yes")} or ${colors.green("no")}`,
    validate: (input: string) =>
      input === "yes" || input === "no" ? true : "Please answer 'yes' or 'no'",
  });
  //=> { confirmation: "yes" }
  const choice = response.confirmation === "yes";
  return choice;
};

const deleteBranches = (branchesToDelete: string[]) => {
  for (const branchName of branchesToDelete) {
    const command = `git branch -D '${branchName}'`;
    console.log(command);
    const result = child_process.execSync(command, { encoding: "utf-8" });
    console.log(result);
  }
  console.log(colors.green("All selected branches deleted."));
};

const main = async (): Promise<void> => {
  if (!isGitRepository()) {
    console.log(
      colors.blue(
        "This is not a Git repository. Please go to a directoy with .git directory."
      )
    );
    return;
  }
  const branches = getGitBranches();
  if (branches.length === 0) {
    console.log(
      colors.blue("There is only the current branch. Nothing to do.")
    );
    return;
  }

  const branchesToDelete = await selectBranchNames(branches);
  if (branchesToDelete.length === 0) {
    return;
  }
  const confirmed = await askForConfirmation(branchesToDelete);
  if (!confirmed) {
    console.log("No branches deleted.");
    return;
  }
  deleteBranches(branchesToDelete);
};

main();
