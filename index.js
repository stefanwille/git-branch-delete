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

main();
