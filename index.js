const child_process = require("child_process");
const { prompt } = require("enquirer");

async function main() {
  const response = await prompt({
    type: "multiselect",

    name: "fruit",
    message: "Favorite fruit?",
    choices: [
      { name: "Apple", message: "Apple", value: "Apple" },
      { name: "Orange", message: "Orange", value: "Orange" },
      { name: "Raspberry", message: "Raspberry", value: "Raspberry" }
    ]
  });

  console.log(response);
  //=> { username: 'jonschlinkert' }
}

// main();

function getGitBranchNames() {
  const text = child_process.execSync("git branch", { encoding: "utf-8" });
  const lines = text.split("\n");
  const branchNames = lines.map(line => line.substring(2));
  const filteredBranchNames = branchNames.filter(
    branchName => branchName !== ""
  );
  return filteredBranchNames;
}

console.log(getGitBranchNames());
