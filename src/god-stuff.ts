import { Client } from 'pg'
import { PgGodError } from './error'

export type DbCredential = {
  user: string
  database: string
  port: number
  host: string
  password: string
  connectionString?: string
}

const defaultDbCred: DbCredential = {
  user: 'postgres',
  database: 'postgres',
  password: '',
  port: 5432,
  host: 'localhost',
}

export type NewDbConfig = {
  databaseName: string,
  errorIfExist?: boolean,
}

/**
 * @param newDbConfig Requires a `databaseName` you are trying to create. `errorIfExist` is default to false. When `errorIfExist` is `true`,
 * it will throw error when database already exist before executing creation.
 * @param dbCredential Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `errorProtocol`.
 *
 * @example createDatabase({ databaseName: 'bank-development' })
 */
export async function createDatabase(newDbConfig: NewDbConfig, dbCredential: Partial<DbCredential>=defaultDbCred) {
  const cred = { ...defaultDbCred, ...dbCredential }
  const client = new Client(cred.connectionString ? { connectionString: cred.connectionString } : cred)
  try {
    client.connect()

    const existingDb = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${newDbConfig.databaseName}');
    `)

    if (existingDb.rowCount > 0 && newDbConfig.errorIfExist) throw PgGodError.dbAlreadyExist()
    if (existingDb.rowCount > 0 && !newDbConfig.errorIfExist) return

    await client.query(`CREATE DATABASE "${newDbConfig.databaseName}";`)
  } catch (error) {
    throw PgGodError.fromPgError(error)
  } finally {
    await client.end()
  }
}

export type DropDbConfig = {
  databaseName: string,
  errorIfNonExist?: boolean,
  dropConnections?: boolean,
}
/**
 * @param dropDbConfig.databaseName Requires a `databaseName` you are trying to drop.
 * @param dropDbConfig.errorIfNonExist is default to false. When `errorIfNonExist` is `true`, it will throw error when database doesn't exist before executing drop.
 * @param dropDbConfig.dropConnections is default to true. When `dropConnections` is `true`, it will automatically drop all current connections to the database.
 * @param dbCredential Default to localhost:5432 `postgres` database and `postgres` user with empty password.
 * @throws `PgDbGodError` More details at `errorProtocol`.
 *
 * @example dropDatabase({ databaseName: 'bank-development' })
 */
export async function dropDatabase(dropDbConfig: DropDbConfig, dbCredential: DbCredential=defaultDbCred) {
  const cred = { ...defaultDbCred, ...dbCredential }
  const client = new Client(cred.connectionString ? { connectionString: cred.connectionString } : cred)
  try {
    client.connect()

    const existingDb = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${dropDbConfig.databaseName}');
    `)

    if (existingDb.rowCount === 0 && dropDbConfig.errorIfNonExist) throw PgGodError.dbDoesNotExist()
    if (existingDb.rowCount === 0 && !dropDbConfig.errorIfNonExist) return

    if (dropDbConfig.dropConnections !== false) await dropDbConnections(client, dropDbConfig.databaseName)

    await client.query(`DROP DATABASE "${dropDbConfig.databaseName}";`)
  } catch (error) {
    throw PgGodError.fromPgError(error)
  } finally {
    await client.end()
  }
}

async function dropDbConnections(client: Client, dbName: string) {
  return client.query(`
    SELECT
      pg_terminate_backend(pg_stat_activity.pid)
    FROM
      pg_stat_activity
    WHERE
      pg_stat_activity.datname = '${dbName}'
      AND pid <> pg_backend_pid();
  `)
}
