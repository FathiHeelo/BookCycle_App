/**
 * universityFilter.ts
 * Central filtering utilities — use these everywhere instead of inline logic.
 * Implements the backward-compatibility rule: missing universityId = "najah"
 */

import { DEFAULT_UNIVERSITY_ID } from '@/src/config/universities';

export interface WithUniversityId {
  universityId?: string;
}

/**
 * Returns the universityId for a record.
 * Falls back to DEFAULT_UNIVERSITY_ID ("najah") for old records without the field.
 */
export function getRecordUniversityId(record: WithUniversityId): string {
  return record.universityId || DEFAULT_UNIVERSITY_ID;
}

/**
 * Returns true if the record belongs to the specified university.
 * Applies the backward-compatibility fallback automatically.
 */
export function belongsToUniversity(
  record: WithUniversityId,
  universityId: string
): boolean {
  return getRecordUniversityId(record) === universityId;
}

/**
 * Filters an array of records to only those belonging to the given university.
 */
export function filterByUniversity<T extends WithUniversityId>(
  records: T[],
  universityId: string
): T[] {
  return records.filter((r) => belongsToUniversity(r, universityId));
}
