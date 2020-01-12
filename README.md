<img width="460" alt="die HausWirtschaft Logo" src="https://tools.diehauswirtschaft.at/public-static-files/logos/dhw-signet-logotype.png">

# provision-nextcloud

Batch imports and manages users for Nextcloud using the Provisioning API. This is an alternative to the well-known
[Registration App](https://apps.nextcloud.com/apps/registration) for Nextcloud. If you cannot limit the
allowed registrations to a specific domain-suffix, you open it up to the whole Web. In times of automated scripts scanning
the Web for open instances, this is not the best idea.

<hr>

This project has been developed in the scope of [OPENhauswirtschaft][1]
to provision Nextcloud accounts to all members.
OPENhauswirtschaft is powered by the Austrian ["Klima- und Energiefonds"][2]'s
*[Smart Cities Demo - Living Urban Innovation][3]* program.

<img width="200" alt="" src="https://tools.diehauswirtschaft.at/public-static-files/logos/klien-poweredby.jpg">

## Usage

You can see all available commands and options with `node index.js -h`:

```text
Usage: index [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        output usage information

Commands:
  add [options] <users.json> <nextcloud-url>
  welcome [options] <users.json> <nextcloud-url>
  setting <users.json> <key> <value>
```

### `add` command

Adds the given users to a Nextcloud instance. You can specify groups which will be applied to each newly created user.
Use the `--dry-run` option to perform a local dry run without any requests sent to the given Nextcloud server.

```bash
node index.js add --dry-run myUsers.json https://nextcloud.example.com/
```

### `welcome` command

Sends out a welcome email to the given users. You should use this command after you set the user's language to the
correct language tag. Otherwise the welcome emails will be in English. Use the `--dry-run` option to perform a local
dry run without any requests sent to the given Nextcloud server.

```bash
node index.js welcome --dry-run myUsers.json https://nextcloud.example.com/
```

### `setting` command

Prints out a list of shell commands using the `occ` command to modify a user setting. You find a list of valid settings
in the [Nextloud documentation](https://docs.nextcloud.com/server/15/admin_manual/configuration_server/occ_command.html#user-commands).

```bash
node index.js setting myUsers.json "core lang" "de"
```

## Example `user.json`

You have to provide a JSON file with all the users you want to add inside an array.
The `userid` and `password` properties are required for each user, all others are optional.

```json
[
  {
    "userid": "exampleuser",
    "password": "randompasswordstring",
    "groups": [
      "Cool People",
      "Department X"
    ],
    "displayname": "Example User",
    "email": "user@example.com",
    "quota": "10GB",
    "phone": "+55 555 1234567",
    "address": "Taborstraße 12345, 1020 Wien, Austria",
    "website": "https://diehauswirtschaft.at",
    "twitter": "@DHausWirtschaft"
  }
]
```

## License

MIT

[1]: https://www.smartcities.at/stadt-projekte/smart-cities/#innovatives-hauswirtschaften-im-nutzungsgemischten-stadtkern
[2]: https://www.klimafonds.gv.at/
[3]: https://www.smartcities.at/
