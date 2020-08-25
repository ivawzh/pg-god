import {Command, flags} from '@oclif/command'
import { createDatabase } from '../god-stuff'
import cli from 'cli-ux'
import { parsePostgresUrl, merge } from '../utils'

export default class DbCreate extends Command {
  static aliases = ['db:create']
  static description = 'create an empty database'

  static examples = [
    `$ pg-god db-create --databaseName=bank-db`,
    `$ DB_NAME=bank-db pg-god db-create`,
    `$ pg-god db-create --url postgresql://localhost:5432/bank-db`,
    `$ pg-god db-create --databaseName=bank-db --errorIfExist`,
    `$ pg-god db-create --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    errorIfExist: flags.boolean({char: 'e', default: false, description: '[default: false] whether throw error if DB already exists', env: 'DB_ERROR_IF_EXIST'}),
    initialDb: flags.string({char: 'i', default: 'postgres', description: 'Initial DB name', env: 'DB_INITIAL'}),
    databaseName: flags.string({char: 'n', description: 'new DB name', env: 'DB_NAME', exclusive: ['url']}),
    userName: flags.string({char: 'u', default: 'postgres', description: 'DB user name', env: 'DB_USERNAME', exclusive: ['url']}),
    port: flags.integer({char: 'p', default: 5432, description: 'DB port, default `5432`', env: 'DB_PORT', exclusive: ['url']}),
    host: flags.string({char: 'o', default: 'localhost', description: 'new DB host', env: 'DB_HOST', exclusive: ['url']}),
    password: flags.string({char: 'w', default: '', description: '[default: empty] DB password', env: 'DB_PASSWORD', exclusive: ['url']}),
    url: flags.string({char: 'l', description: 'DB URL, e.g. postgres://username:password@localhost:5432/my_db', env: 'DB_URL', exclusive: [
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
        errorIfExist,
        initialDb,
        url: dbUrl,
        ...flags
      }
    } = this.parse(DbCreate)
    const urlParams = dbUrl ? parsePostgresUrl(dbUrl) : {}
    const finalParams = merge(urlParams, flags)
    const {
      databaseName,
      userName,
      port,
      host,
      password,
    } = finalParams

    cli.action.start(`😇 Create database '${databaseName}'`)

    if(!databaseName) throw new Error('Missing required flags/ENV - databaseName("DB_NAME") or url("DB_URL")')

    await createDatabase(
      { databaseName, errorIfExist },
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
