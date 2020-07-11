# pg-god 😇

Tiny library that helps create and kill PostgreSQL database.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pg-god.svg)](https://npmjs.org/package/pg-god)
[![Downloads/week](https://img.shields.io/npm/dw/pg-god.svg)](https://npmjs.org/package/pg-god)
[![License](https://img.shields.io/npm/l/pg-god.svg)](https://github.com/ivawzh/pg-god/blob/master/package.json)

<!-- toc -->
* [pg-god 😇](#pg-god-)
<!-- tocstop -->
## Usage
<!-- usage -->
```sh
$ npm install pg-god
$ pg-god db-create --databaseName=bank-db
...
```

### Programmatically

```ts
import { createDatabase, dropDatebase } from 'pg-god'

async function main() {
  await createDatabase({ databaseName: 'pocketmon-bank' })
  await dropDatabase({ databaseName: 'pocketmon-bank' })
}
```

If you want to use with TypeORM checkout [With TypeORM](#with-typeorm)

<!-- usagestop -->
## CLI Commands
<!-- commands -->
- [pg-god 😇](#pg-god-)
  - [Usage](#usage)
    - [Programmatically](#programmatically)
  - [CLI Commands](#cli-commands)
  - [`pg-god db-create`](#pg-god-db-create)
  - [`pg-god db-drop`](#pg-god-db-drop)
  - [`pg-god help [COMMAND]`](#pg-god-help-command)
- [With TypeORM](#with-typeorm)

## `pg-god db-create`

describe the command here

```log
create an empty database

USAGE
  $ pg-god db-create

OPTIONS
  -e, --errorIfExist               [default: false] whether throw error if DB already exists
  -h, --help                       show CLI help
  -h, --host=host                  [default: localhost] DB host
  -i, --initialDb=initialDb        [default: postgres] Initial DB name
  -n, --databaseName=databaseName  (required) new DB name
  -p, --port=port                  [default: 5432] DB port, default `5432`
  -u, --userName=userName          [default: postgres] DB user name
  -w, --password=password          [default: empty] DB password

ALIASES
  $ pg-god db:create

EXAMPLES
  $ pg-god db-create --databaseName=bank-db
  $ pg-god db-create --databaseName=bank-db --errorIfExist
  $ pg-god db-create --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer
```

## `pg-god db-drop`

```log
drop a database

USAGE
  $ pg-god db-drop

OPTIONS
  -e, --errorIfNonExist            [default: false] whether throw error if DB doesn't exists
  -h, --help                       show CLI help
  -h, --host=host                  [default: localhost] DB host
  -i, --initialDb=initialDb        [default: postgres] Initial DB name
  -n, --databaseName=databaseName  (required) name of DB attempt to drop
  -p, --port=port                  [default: 5432] DB port, default `5432`
  -u, --userName=userName          [default: postgres] DB user name
  -w, --password=password          [default: empty] DB password

ALIASES
  $ pg-god db:drop

EXAMPLES
  $ pg-god db-drop --databaseName=bank-db
  $ pg-god db-drop --databaseName=bank-db --errorIfNonExist
  $ pg-god db-drop --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer
```

## `pg-god help [COMMAND]`

display help for pg-god

```log
Tiny library that helps create and kill PostgreSQL database.

VERSION
  pg-god/1.0.1 darwin-x64 node-v12.16.1

USAGE
  $ pg-god [COMMAND]

COMMANDS
  db-create  create an empty database
  db-drop    drop a database
  help       display help for pg-god
```

<!-- commandsstop -->

# With TypeORM

```ts
// at index.ts
import { createDatabase } from 'pg-god'
import { createConnection, Connection, getConnection } from 'typeorm'

let conn: Connection | undefined

export async function superCreateConnection(): Promise<Connection> {
  if (conn) return conn
  // may either read from ormconfig or hardcode your options here
  const ormOpts: PostgresConnectionOptions = await getOptions()
  try {
    conn = await createConnection(ormOpts)
    return conn
  } catch (error) {
    if (error.code === '3D000') {
      // Database doesn't exist.
      // PG error code ref: https://docstore.mik.ua/manuals/sql/postgresql-8.2.6/errcodes-appendix.html
      await createDatabase(
        { databaseName: ormOpts.database },
        {
          user: ormOpts.username,
          port: ormOpts.port,
          host: ormOpts.host,
          password:
            (typeof ormOpts.password === 'undefined') ? undefined :
            (typeof ormOpts.password === 'string') ? ormOpts.password :
            await ormOpts.password()
          ,
        }
      )
      return superCreateConnection()
    }
    throw error
  }
}
```
