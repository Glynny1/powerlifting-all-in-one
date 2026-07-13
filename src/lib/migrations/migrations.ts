import { SCHEMA_VERSION } from '../../types';

/**
 * LocalStorage migration pipeline.
 *
 * Each migration takes the raw stored object at version N and returns a raw
 * object at version N+1. Migrations run in order until the data reaches
 * SCHEMA_VERSION. Register future migrations in the `migrations` map below.
 *
 * Migrations operate on loosely-typed objects on purpose: stored data may
 * predate current types. Validation/normalisation happens afterwards.
 */

type RawData = Record<string, unknown>;
type Migration = (data: RawData) => RawData;

// Example future migration (kept as documentation of the pattern):
// const migrations: Record<number, Migration> = {
//   1: (data) => ({ ...data, schemaVersion: 2, /* transform */ }),
// };
const migrations: Record<number, Migration> = {};

export function migrateToLatest(input: unknown): RawData {
  let data: RawData =
    typeof input === 'object' && input !== null ? { ...(input as RawData) } : {};

  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 0;

  // Unknown/older-than-known: treat as version 0 and let migrations (or the
  // caller's validation + default fallback) handle it.
  let guard = 0;
  while (version < SCHEMA_VERSION && guard < 100) {
    const migrate = migrations[version];
    if (!migrate) {
      // No migration path defined for this step; stamp current version and let
      // downstream validation coerce or reject.
      data.schemaVersion = SCHEMA_VERSION;
      break;
    }
    data = migrate(data);
    version = typeof data.schemaVersion === 'number' ? data.schemaVersion : version + 1;
    guard += 1;
  }

  data.schemaVersion = SCHEMA_VERSION;
  return data;
}
