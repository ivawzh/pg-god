import {Command, flags} from '@oclif/command'
import { dropDatabase } from '../god-stuff'
import cli from 'cli-ux'

export default class DbDrop extends Command {
  static aliases = ['db:drop']
  static description = 'drop a database'

  static examples = [
    `$ pg-god db-drop --databaseName=bank-db`,
    `$ pg-god db-drop --databaseName=bank-db --errorIfNonExist --no-dropConnections`,
    `$ pg-god db-drop --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    databaseName: flags.string({char: 'n', required: true, description: 'name of DB attempt to drop', env: 'DB_NAME'}),
    errorIfNonExist: flags.boolean({char: 'e', default: false, description: "[default: false] whether throw error if DB doesn't exist", env: 'DB_ERROR_IF_NON_EXIST'}),
    dropConnections: flags.boolean({char: 'd', default: true, allowNo: true, description: "[default: true] whether automatically drop DB connections"}),
    userName: flags.string({char: 'u', default: 'postgres', description: 'DB user name', env: 'DB_USERNAME'}),
    initialDb: flags.string({char: 'i', default: 'postgres', description: 'Initial DB name', env: 'DB_INITIAL'}),
    port: flags.integer({char: 'p', default: 5432, description: 'DB port, default `5432`', env: 'DB_PORT'}),
    host: flags.string({char: 'h', default: 'localhost', description: 'DB host', env: 'DB_HOST'}),
    password: flags.string({char: 'w', default: '', description: '[default: empty] DB password', env: 'DB_PASSWORD'}),
  }

  async run() {
    const {
      flags: {
        databaseName,
        errorIfNonExist,
        dropConnections,
        userName,
        initialDb,
        port,
        host,
        password,
      }
    } = this.parse(DbDrop)

    cli.action.start(`😇 Drop database '${databaseName}'`)

    await dropDatabase(
      {
        databaseName,
        errorIfNonExist,
        dropConnections,
      },
      {
        user: userName,
        database: initialDb,
        port: port,
        host: host,
        password: password,
      }
    )

    cli.action.stop()
  }
}
