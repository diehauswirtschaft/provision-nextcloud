const BASE_API_PATH = "ocs/v1.php/cloud";
const {
    getNextcloudClient,
    getResponseStatusCode,
    getResponseMessage,
    checkUsers
} = require("../utils");

/**
 * Sends out a new welcome email to the given user.
 * @param nextcloudUrl {String}
 * @param username {String}
 * @param password {String}
 * @param user {Object}
 * @return {Promise<void>}
 */
async function sendWelcomeEmail(nextcloudUrl, username, password, user) {
    const nextcloudClient = getNextcloudClient();
    const BASE_URL = nextcloudUrl + (nextcloudUrl.slice(-1) === "/" ? "" : "/") + BASE_API_PATH;

    const welcomeResponse = await nextcloudClient(
        {
            method: `post`,
            url: `${BASE_URL}/users/${encodeURIComponent(user.userid)}/welcome`,
            responseType: `json`,
            auth: {
                username,
                password
            }
        }
    );

    // check the response ...
    if (welcomeResponse.status !== 200 || getResponseStatusCode(welcomeResponse.data) !== 100) {
        throw new Error(
            `Could not send mail to ${user.userid} on ${nextcloudUrl}!` +
            `Response: HTTP ${welcomeResponse.status}\n${JSON.stringify(welcomeResponse.data, null, 2)}`
        );
    }
}

/**
 * Sends a welcome email to the given users at the specified Nextcloud instance.
 * @param {Array} users array of users to add
 * @param {String} nextcloudUrl absolute URL to Nextcloud's root
 * @param {String} username admin username
 * @param {String} password the admin's password
 * @param {boolean} dryRun only perform a dry run without actually sending out requests, defaults to false
 */
exports.sendEmails = function(users, nextcloudUrl, username, password, dryRun = false) {
    if (!checkUsers(users)) {
        console.error("Aborted. No emails have been sent.");
        return;
    }

    for (const user of users) {
        if (dryRun) {
            console.log(`Dry run => this would send a welcome mail to ${user.userid}`);
        } else {
            sendWelcomeEmail(nextcloudUrl, username, password, user)
                .then(() =>  {
                    console.log(`Sent mail to ${user.userid}`);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
};
