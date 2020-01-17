#!/usr/bin/env node

const fs = require("fs");
const provisioner = require("./actions/provisioner");
const welcomer = require("./actions/welcomer");
const occsettings = require("./actions/occ-settings");

const inquirer = require("inquirer");
const program = require("commander");
program.version("1.0.0");

/**
 * Reads the given file and parses it as JSON. We could use some JSON schema validation here,
 * but to avoid dependencies we treat schema validation negligible.
 */
function readJSON(path) {
    try {
        const users = JSON.parse(fs.readFileSync(path));
        if (!Array.isArray(users)) {
            return Promise.reject("JSON object must be an array of users!");
        } else {
            return Promise.resolve(users);
        }
    } catch (e) {
        console.error(`Could not read or parse user JSON at ${path}`);
        return Promise.reject(e);
    }
}

/**
 * Prompt for the Nextcloud user credentials.
 * @returns {Promise<*>}
 */
async function getCredentials() {
    return await inquirer
        .prompt([
            {
                type: "input",
                name: "username",
                message: "Your Nextcloud username"
            },
            {
                type: "password",
                message: "Your Nextcloud password",
                name: "password",
                mask: '*'
            }
        ]);
}

/**
 * Adds new users to the Nextcloud instance.
 */
program.command("add <users.json> <nextcloud-url>")
    .option("-d, --dry-run", "Dry run without sending out requests to your Nextcloud instance")
    .action(function (userJson, nextcloudUrl, cmd) {
        if (cmd.dryRun === true) {
            console.log(`This is a dry run and will send any request to ${nextcloudUrl}`);
        }

        readJSON(userJson)
            .then((users) => {
                getCredentials().then(({username, password}) => {
                    provisioner.provision(users, nextcloudUrl, username, password, (cmd.dryRun === true));
                });
            })
            .catch((e) => {
                console.error(e);
            });
    });

/**
 * Sends out welcome mails.
 */
program.command("welcome <users.json> <nextcloud-url>")
    .option("-d, --dry-run", "Dry run without sending out requests to your Nextcloud instance")
    .action(function (userJson, nextcloudUrl, cmd) {
        if (cmd.dryRun === true) {
            console.log(`This is a dry run and will send any request to ${nextcloudUrl}`);
        }

        readJSON(userJson)
            .then((users) => {
                getCredentials().then(({username, password}) => {
                    welcomer.sendEmails(users, nextcloudUrl, username, password, (cmd.dryRun === true));
                });
            })
            .catch((e) => {
                console.error(e);
            });
    });

/**
 * Prints the setting commands to the console.
 */
program.command("setting <users.json> <key> <value>")
    .action(function (userJson, key, value) {
        readJSON(userJson)
            .then((users) => {
                occsettings.printCommand(users, key, value);
            })
            .catch((e) => {
                console.error(e);
            });
    });

program.parse(process.argv);
