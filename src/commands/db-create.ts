import {Command, flags} from '@oclif/command'
import { createDatabase } from '../god-stuff'
import cli from 'cli-ux'

export default class DbCreate extends Command {
  static aliases = ['db:create']
  static description = 'create an empty database'

  static examples = [
    `$ pg-god db-create --databaseName=bank-db`,
    `$ pg-god db-create --databaseName=bank-db --errorIfExist`,
    `$ pg-god db-create --databaseName=bank-db --password=123 --port=5433 --host=a.example.com --userName=beer`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    databaseName: flags.string({char: 'n', required: true, description: 'new DB name', env: 'DB_NAME'}),
    errorIfExist: flags.boolean({char: 'e', default: false, description: '[default: false] whether throw error if DB already exists', env: 'DB_ERROR_IF_EXIST'}),
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
        errorIfExist,
        userName,
        initialDb,
        port,
        host,
        password,
      }
    } = this.parse(DbCreate)

    cli.action.start(`😇 Start to create database '${databaseName}'`)

    await createDatabase(
      { databaseName, errorIfExist },
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
