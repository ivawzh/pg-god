
// PG error ref: https://docstore.mik.ua/manuals/sql/postgresql-8.2.6/errcodes-appendix.html
export const errorProtocol = {
  '42P04': {
    name: 'PDG_ERR::DuplicateDatabase',
    code: '42P04',
    message: 'Database already exist.'
  },
  '3D000': {
    name: 'PDG_ERR::InvalidCatalogName',
    code: '3D000',
    message: 'Database does not exist.'
  },
  '23505': {
    name: 'PDG_ERR::UniqueViolation',
    code: '23505',
    message: 'Attempt to create multiple databases concurrently.'
  },
  '55006': {
    name: 'PDG_ERR::DropDatabaseInUse',
    code: '55006',
    message: 'Cannot delete a database that is being accessed by other users.'
  },
}

export class PgDbGodError implements Error {
  constructor(
    readonly name: string,
    readonly message: string,
    readonly code: string,
    readonly stack?: string
  ) {}

  public static fromPgError(pgError: Error & { code?: string }): PgDbGodError {
    return new PgDbGodError(
      // Until resolution of index issue: https://github.com/Microsoft/TypeScript/issues/14951#issuecomment-291617624
      // @ts-ignore
      errorProtocol[pgError.code]?.name || 'PDG_ERR::UnexpectedError',
      // @ts-ignore
      (errorProtocol[pgError.code]?.message || pgError.message),
      pgError.code || 'unknown',
      pgError.stack,
    )
  }

  public static dbAlreadyExist(): PgDbGodError {
    const code = '42P04'
    return new PgDbGodError(
      errorProtocol[code].name,
      errorProtocol[code].message,
      code,
      Error().stack,
    )
  }

  public static dbDoesNotExist(): PgDbGodError {
    const code = '3D000'
    return new PgDbGodError(
      errorProtocol[code].name,
      errorProtocol[code].message,
      code,
      Error().stack,
    )
  }
}
