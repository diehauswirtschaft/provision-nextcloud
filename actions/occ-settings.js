const {
    checkUsers
} = require("../utils");

/**
 * Outputs the occ commands to set a specific setting of an user.
 * @param {Array} users array of users to add
 * @param {String} key the key to set
 * @param {String} value the value of the given key
 */
exports.printCommand = function(users, key, value) {
    // check if the given users are valid
    if (!checkUsers(users)) {
        console.error("Aborted. No users have been created.");
        return;
    }

    for (const user of users) {
        console.log(`sudo -u www-data php occ user:setting "${user.userid}" ${key} "${value}"`);
    }
};
