import { Client } from 'pg'
import { PgGodError } from './error'
import * as url from 'url'

export type DbCredential = {
  user: string
  database: string
  port: number
  host: string
  password: string
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
export async function createDatabase(newDbConfig: NewDbConfig, dbCredential:Partial<DbCredential>=defaultDbCred) {
  const client = new Client({ ...defaultDbCred, ...dbCredential })
  try {
    await client.connect()
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
export async function dropDatabase(dropDbConfig: DropDbConfig, dbCredential: Partial<DbCredential>=defaultDbCred) {
  const client = new Client({ ...defaultDbCred, ...dbCredential })
  try {
    await client.connect()
    const existingDb = await client.query(`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE lower(datname) = lower('${dropDbConfig.databaseName}');
    `)

    if (existingDb.rowCount === 0 && dropDbConfig.errorIfNonExist) throw PgGodError.dbDoesNotExist()
    if (existingDb.rowCount === 0 && !dropDbConfig.errorIfNonExist) return

    if (dropDbConfig.dropConnections !== false) await dropDbOtherUserConnections(client, dropDbConfig.databaseName)

    await client.query(`DROP DATABASE "${dropDbConfig.databaseName}";`)
  } catch (error) {
    throw PgGodError.fromPgError(error)
  } finally {
    await client.end()
  }
}

async function dropDbOtherUserConnections(client: Client, dbName: string) {
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

export function parseDbUrl(dbUrl: string | undefined) {
  if (!dbUrl) return {}
  const urlQuery = url.parse(dbUrl)
  return {
    scheme: urlQuery.protocol?.substr(0, urlQuery.protocol?.length - 1),
    userName: urlQuery.auth?.substr(0, urlQuery.auth?.indexOf(':')),
    password: urlQuery.auth?.substr(urlQuery.auth?.indexOf(':') + 1, urlQuery.auth?.length),
    host: urlQuery.hostname,
    port: urlQuery.port,
    databaseName: urlQuery.path?.slice(1),
  }
}

/**
 * Shallow merge objects without overriding fields with `undefined`.
 * TODO: return better types
 */
export function merge(target: object, ...sources: object[]) {
  return Object.assign({}, target, ...sources.map(x =>
    Object.entries(x)
      .filter(([key, value]) => value !== undefined)
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {} as Record<string, undefined>)
  ))
}
