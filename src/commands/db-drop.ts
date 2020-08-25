import {Command, flags} from '@oclif/command'
import { dropDatabase } from '../god-stuff'
import cli from 'cli-ux'
import { parsePostgresUrl, merge } from '../utils'

export default class DbDrop extends Command {
  static aliases = ['db:drop']
  static description = 'drop a database'

  static examples = [
    `$ pg-god db-drop --databaseName=bank-db`,
    `$ DB_NAME=bank-db pg-god db-drop`,
    `$ pg-god db-drop --url postgresql://localhost:5432/bank-db`,
    `$ pg-god db-drop --databaseName=bank-db --errorIfNonExist --no-dropConnections`,
    `$ pg-god db-drop --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    errorIfNonExist: flags.boolean({char: 'e', default: false, description: "[default: false] whether throw error if DB doesn't exist", env: 'DB_ERROR_IF_NON_EXIST'}),
    dropConnections: flags.boolean({char: 'd', default: true, allowNo: true, description: "[default: true] whether automatically drop DB connections", env: 'DROP_CONNECTIONS'}),
    initialDb: flags.string({char: 'i', default: 'postgres', description: 'Initial DB name', env: 'DB_INITIAL'}),
    databaseName: flags.string({char: 'n', description: 'name of DB that will be dropped', env: 'DB_NAME', exclusive: ['url']}),
    userName: flags.string({char: 'u', default: 'postgres', description: 'DB user name', env: 'DB_USERNAME', exclusive: ['url']}),
    port: flags.integer({char: 'p', default: 5432, description: 'DB port, default `5432`', env: 'DB_PORT', exclusive: ['url']}),
    host: flags.string({char: 'o', default: 'localhost', description: 'DB host', env: 'DB_HOST', exclusive: ['url']}),
    password: flags.string({char: 'w', default: '', description: '[default: empty] DB password', env: 'DB_PASSWORD', exclusive: ['url']}),
    url: flags.string({char: 'l', description: 'URL of DB that will be dropped, e.g. postgres://username:password@localhost:5432/my_db', env: 'DB_URL', exclusive: [
      'databaseName',
      'userName',
      'port',
      'host',
      'password',
    ]}),
  }

  async run() {
    const {
      flags: {
        help,
        errorIfNonExist,
        dropConnections,
        initialDb,
        url: dbUrl,
        ...flags
      }
    } = this.parse(DbDrop)

    const urlParams = dbUrl ? parsePostgresUrl(dbUrl) : {}
    const finalParams = merge(urlParams, flags)
    const {
      databaseName,
      userName,
      port,
      host,
      password,
    } = finalParams

    cli.action.start(`😇 Drop database '${databaseName}'`)

    if(!databaseName) throw new Error('Missing required flags/ENV - databaseName("DB_NAME") or url("DB_URL")')

    await dropDatabase(
      {
        databaseName,
        errorIfNonExist,
        dropConnections,
      },
      {
        user: userName,
        database: initialDb,
        port,
        host,
        password,
      }
    )

    cli.action.stop()
  }
}
