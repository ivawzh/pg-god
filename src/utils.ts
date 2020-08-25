import * as url from 'url'

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

export function parsePostgresUrl(dbUrl: string) {
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
