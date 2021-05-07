#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var enquirer = require("enquirer");
var colors = require("ansi-colors");
function isGitRepository() {
    var dir = process.cwd();
    for (;;) {
        var gitDir = path.resolve(dir, ".git");
        if (fs.existsSync(gitDir)) {
            return true;
        }
        if (dir === "/") {
            return false;
        }
        dir = path.resolve(dir, "..");
    }
}
function getGitBranchNames() {
    var text = child_process.execSync("git branch", { encoding: "utf-8" });
    var lines = text.split("\n");
    var linesWithoutCurrentBranch = lines.filter(function (line) { return !line.startsWith("* "); });
    var branchNames = linesWithoutCurrentBranch.map(function (line) { return line.substring(2); });
    var filteredBranchNames = branchNames.filter(function (branchName) { return branchName !== ""; });
    return filteredBranchNames;
}
function selectBranchNames(branchNames) {
    return __awaiter(this, void 0, void 0, function () {
        var choices, response, selectedBranchNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    choices = branchNames.map(function (branchName) { return ({
                        name: branchName,
                        message: branchName,
                        value: branchName
                    }); });
                    return [4 /*yield*/, enquirer.prompt({
                            type: "multiselect",
                            name: "branchNames",
                            message: "Which branches do you want to delete?",
                            choices: choices
                        })];
                case 1:
                    response = _a.sent();
                    selectedBranchNames = response.branchNames;
                    return [2 /*return*/, selectedBranchNames];
            }
        });
    });
}
function askForConfirmation(branchesToDelete) {
    return __awaiter(this, void 0, void 0, function () {
        var response, choice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(colors.red.bold.underline("You have selected these branches to delete:"));
                    console.log(branchesToDelete
                        .map(function (branchName, index) { return " " + (index + 1) + ". " + branchName; })
                        .join("\n"));
                    return [4 /*yield*/, enquirer.prompt({
                            type: "input",
                            name: "confirmation",
                            message: "Delete these " + branchesToDelete.length + " branches? Type " + colors.green("yes") + " or " + colors.green("no"),
                            validate: function (input) {
                                return input === "yes" || input === "no" ? true : "Please answer 'yes' or 'no'";
                            }
                        })];
                case 1:
                    response = _a.sent();
                    choice = response.confirmation === "yes";
                    return [2 /*return*/, choice];
            }
        });
    });
}
function deleteBranches(branchesToDelete) {
    for (var _i = 0, branchesToDelete_1 = branchesToDelete; _i < branchesToDelete_1.length; _i++) {
        var branchName = branchesToDelete_1[_i];
        var command = "git branch -D " + branchName;
        console.log(command);
        var result = child_process.execSync(command, { encoding: "utf-8" });
        console.log(result);
    }
    console.log(colors.green("All selected branches deleted."));
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var branchNames, branchesToDelete, confirmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isGitRepository()) {
                        console.log(colors.blue("This is not a Git repository. Please go to a directoy with .git directory."));
                        return [2 /*return*/];
                    }
                    branchNames = getGitBranchNames();
                    if (branchNames.length === 0) {
                        console.log(colors.blue("There is only the current branch. Nothing to do."));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, selectBranchNames(branchNames)];
                case 1:
                    branchesToDelete = _a.sent();
                    if (branchesToDelete.length === 0) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, askForConfirmation(branchesToDelete)];
                case 2:
                    confirmed = _a.sent();
                    if (!confirmed) {
                        console.log("No branches deleted.");
                        return [2 /*return*/];
                    }
                    deleteBranches(branchesToDelete);
                    return [2 /*return*/];
            }
        });
    });
}
main();
