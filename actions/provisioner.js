const BASE_API_PATH = "ocs/v1.php/cloud";

const {
    checkUsers,
    getNextcloudClient,
    getResponseStatusCode,
    getResponseMessage,
    USER_DATA_KEYS
} = require("../utils");

const qs = require("querystring");

/**
 * Creates a new user on the given instance
 * @param nextcloudUrl {String}
 * @param username {String}
 * @param password {String}
 * @param user {Object}
 * @return {Promise<void>}
 */
async function createUser(nextcloudUrl, username, password, user) {
    const nextcloudClient = getNextcloudClient();
    const BASE_URL = nextcloudUrl + (nextcloudUrl.slice(-1) === "/" ? "" : "/") + BASE_API_PATH;

    // 1. test if the API is responding
    const apiCheckResponse = await nextcloudClient.get(
        `${BASE_URL}/users`,
        {
            auth: {
                username,
                password
            }
        }
    );

    if (apiCheckResponse.status !== 200 || getResponseStatusCode(apiCheckResponse.data) !== 100) {
        throw new Error(
            `Could not connect to the API on ${nextcloudUrl}!\n` +
            `Response: HTTP ${apiCheckResponse.status}\n${JSON.stringify(apiCheckResponse.data, null, 2)}`
        );
    }

    //
    // 2. add the user to Nextcloud
    //
    console.log(`  Adding ${user.userid} ...`);
    const userResponse = await nextcloudClient(
        {
            method: `post`,
            url: `${BASE_URL}/users?` + (user.groups || []).map(group => `groups[]=${encodeURIComponent(group)}`).join("&"),
            responseType: `json`,
            auth: {
                username,
                password
            },
            data: qs.stringify({
                userid: user.userid,
                password: user.password
            })
        }
    );

    // check the response ...
    if (userResponse.status !== 200 || getResponseStatusCode(userResponse.data) !== 100) {
        throw new Error(
            `Could not create user ${user.userid} on ${nextcloudUrl}!` +
            `Response: HTTP ${userResponse.status}\n${JSON.stringify(userResponse.data, null, 2)}`
        );
    }

    // small helper function for the user data update
    async function updateUserData(userid, key, value) {
        const updateResponse = await nextcloudClient(
            {
                method: 'put',
                url: `${BASE_URL}/users/${encodeURIComponent(userid)}`,
                responseType: `json`,
                auth: {
                    username,
                    password
                },
                data: qs.stringify({
                    key,
                    value
                })
            }
        );

        // check the response ...
        if (updateResponse.status !== 200 || getResponseStatusCode(updateResponse.data) !== 100) {
            throw new Error(
                `Could not update user ${user.userid} on ${nextcloudUrl}!\nData: ${key} => ${value}\n ` +
                `Response: HTTP ${updateResponse.status}\n${JSON.stringify(updateResponse.data, null, 2)}`
            );
        }
    }

    //
    // 3. update all optional user data
    //
    console.log(`  Updating user profile settings for ${user.userid} ...`);
    for (const key of USER_DATA_KEYS) {
        if (user.hasOwnProperty(key)) {
            await updateUserData(user.userid, key, user[key]);
        }
    }
}

/**
 * Provisions the given users at the specified Nextcloud instance.
 * @param {Array} users array of users to add
 * @param {String} nextcloudUrl absolute URL to Nextcloud's root
 * @param {String} username admin username
 * @param {String} password the admin's password
 * @param {boolean} dryRun only perform a dry run without actually sending out requests, defaults to false
 */
exports.provision = function(users, nextcloudUrl, username, password, dryRun = false) {
    // check if the given users are valid
    if (!checkUsers(users)) {
        console.error("Aborted. No users have been created.");
        return;
    }

    for (const user of users) {
        if (dryRun) {
            console.log(`Dry run => this would create user ${user.userid}`);
        } else {
            createUser(nextcloudUrl, username, password, user)
                .then(() =>  {
                    console.log(`Created new user ${user.userid}`);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
};
