#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const enquirer = require("enquirer");
const colors = require("ansi-colors");

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

const getGitBranchNames = (): string[] => {
  const text = child_process.execSync("git branch", { encoding: "utf-8" });
  const lines: string[] = text.split("\n");
  const linesWithoutCurrentBranch = lines.filter(
    (line) => !line.startsWith("* ")
  );
  const branchNames = linesWithoutCurrentBranch.map((line) =>
    line.substring(2)
  );
  const filteredBranchNames = branchNames.filter(
    (branchName) => branchName !== ""
  );
  return filteredBranchNames;
};

const selectBranchNames = async (branchNames: string[]): Promise<string[]> => {
  const choices = branchNames.map((branchName) => ({
    name: branchName,
    message: branchName,
    value: branchName,
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
    const command = `git branch -D ${branchName}`;
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
  const branchNames = getGitBranchNames();
  if (branchNames.length === 0) {
    console.log(
      colors.blue("There is only the current branch. Nothing to do.")
    );
    return;
  }

  const branchesToDelete = await selectBranchNames(branchNames);
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
