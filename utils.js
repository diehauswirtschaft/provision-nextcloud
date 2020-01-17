const axios = require("axios");

const USER_DATA_KEYS = exports.USER_DATA_KEYS = Object.freeze([
    "email",
    "quota",
    "displayname",
    "phone",
    "address",
    "website",
    "twitter",
]);

/**
 * Checks an array of users and logs errors to the console if something is wrong.
 * @param users {Array} array of user objects
 * @return {boolean} true if every user is valid, false if not
 */
exports.checkUsers = function(users) {
    let allValid = true;

    // check if the given users are valid
    for (const user of users) {
        if (!user.userid || user.userid.length <= 3) {
            allValid = false;
            console.error(`Invalid userid: ${user.userid}`);
        }

        if (!user.password || user.password.length < 10) {
            allValid = false;
            console.error(`Missing or too short (< 10 characters) password for user ${user.userid}: ${user.password}`);
        }

        // check the defined groups
        if (user.groups) {
            if (!Array.isArray(user.groups))  {
                allValid = false;
                console.error(`Groups for ${user.userid} must be an array.`);
            } else if (user.groups.length === 0)  {
                allValid = false;
                console.error(`Groups for ${user.userid} cannot be empty.`);
            } else if (user.groups.some(group => group === "")) {
                allValid = false;
                console.error(`Invalid empty group name in user ${user.userid}.`);
            }
        }

        // basic validation of the user object
        for (const key of Object.keys(user)) {
            // skip already checked keys
            if (key === "userid" || key === "password" || key === "groups") {
                continue;
            }

            // check if no additional keys are present
            if (USER_DATA_KEYS.indexOf(key) < 0) {
                allValid = false;
                console.error(`Invalid data key for user ${user.userid}: ${key}`);
            }

            // check if the quota string is valid
            if (key === "quota" && /^([1-9]\d* ?(MB|GB|TB))?$/.test(user.quota) !== true) {
                allValid = false;
                console.error(`Invalid quota value for user ${user.userid}: ${user.quota}`);
            }
        }
    }

    return allValid;
};

/**
 * Creates a new axios instance suitable for Nextcloud API requests.
 * @return {Object} an axios instance
 */
exports.getNextcloudClient = function () {
    return axios.create({
        headers: {
            "OCS-APIRequest": "true",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    });
};

/**
 * Returns the status code of the API response.
 *
 * @param responseObj {Object}
 * @return {Number} integer status code
 */
exports.getResponseStatusCode = function (responseObj) {
    if (
        responseObj.hasOwnProperty("ocs") &&
        responseObj.ocs.hasOwnProperty("meta") &&
        responseObj.ocs.meta.hasOwnProperty("statuscode")
    ) {
        return responseObj.ocs.meta.statuscode;
    }

    return -1;
};

/**
 * Returns the message of the API response.
 *
 * @param responseObj {Object}
 * @return {String} message string
 */
exports.getResponseMessage = function (responseObj) {
    if (
        responseObj.hasOwnProperty("ocs") &&
        responseObj.ocs.hasOwnProperty("meta") &&
        responseObj.ocs.meta.hasOwnProperty("message")
    ) {
        return responseObj.ocs.meta.message;
    }

    return "";
};
