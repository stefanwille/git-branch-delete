#!/usr/bin/env node

const fs = require("fs");
const child_process = require("child_process");
const { prompt } = require("enquirer");
const colors = require("ansi-colors");

function isGitRepository() {
  return fs.existsSync(".git");
}

function getGitBranchNames() {
  const text = child_process.execSync("git branch", { encoding: "utf-8" });
  const lines = text.split("\n");
  const linesWithoutCurrentBranch = lines.filter(
    line => !line.startsWith("* ")
  );
  const branchNames = linesWithoutCurrentBranch.map(line => line.substring(2));
  const filteredBranchNames = branchNames.filter(
    branchName => branchName !== ""
  );
  return filteredBranchNames;
}

async function selectBranchNames(branchNames) {
  const choices = branchNames.map(branchName => ({
    name: branchName,
    message: branchName,
    value: branchName
  }));
  const response = await prompt({
    type: "multiselect",
    name: "branchNames",
    message: "Which branches do you want to delete?",
    choices
  });

  //=> { branchNames: true }

  const selectedBranchNames = response.branchNames;
  return selectedBranchNames;
}

async function askForConfirmation(branchesToDelete) {
  console.log(
    colors.red.bold.underline("You have selected these branches to delete:")
  );
  console.log(
    branchesToDelete.map(branchName => ` - ${branchName}`).join("\n")
  );
  const response = await prompt({
    type: "input",
    name: "confirmation",
    message: "Really delete these branches (yes / no)?",
    validate: input =>
      input === "yes" || input === "no" ? true : "Please answer 'yes' or 'no'"
  });
  //=> { confirmation: "yes" }
  const choice = response.confirmation === "yes";
  return choice;
}

function deleteBranches(branchesToDelete) {
  for (const branchName of branchesToDelete) {
    const command = `git branch -D ${branchName}`;
    console.log(command);
  }
}

async function main() {
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
  console.log(colors.green("All selected branches deleted."));
}

main();
