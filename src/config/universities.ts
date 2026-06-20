// Universities static configuration
// Add new universities here without touching any screen code

export type UniversityMode = 'live' | 'preview' | 'disabled';

export interface University {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  /** Email domain used to validate student emails */
  domain: string;
  /** Secondary allowed domain (e.g. professors) */
  altDomain?: string;
  logoUrl: string;
  isActive: boolean;
  mode: UniversityMode;
  primaryColor: string;
  /** Configuration for student/university ID validation */
  idPlaceholder: string;
  idMinLength: number;
  idMaxLength: number;
}

export const UNIVERSITIES: University[] = [
  {
    id: 'najah',
    name: 'An-Najah National University',
    shortName: 'An-Najah',
    country: 'Palestine',
    flag: '🇵🇸',
    domain: 'stu.najah.edu',
    altDomain: 'najah.edu',
    logoUrl: 'https://ui-avatars.com/api/?name=AN&background=001B39&color=fff&size=128&bold=true',
    isActive: true,
    mode: 'live',
    primaryColor: '#001B39',
    idPlaceholder: '11920345',
    idMinLength: 8,
    idMaxLength: 10,
  },
  {
    id: 'italy_partner',
    name: 'Partner University – Italy',
    shortName: 'Italy Partner',
    country: 'Italy',
    flag: '🇮🇹',
    domain: 'student.unipartner.it',
    logoUrl: 'https://ui-avatars.com/api/?name=IP&background=009246&color=fff&size=128&bold=true',
    isActive: true,
    mode: 'preview',
    primaryColor: '#009246',
    idPlaceholder: '987654',
    idMinLength: 6,
    idMaxLength: 8,
  },
  {
    id: 'france_partner',
    name: 'Partner University – France',
    shortName: 'France Partner',
    country: 'France',
    flag: '🇫🇷',
    domain: 'student.unipartner.fr',
    logoUrl: 'https://ui-avatars.com/api/?name=FP&background=002395&color=fff&size=128&bold=true',
    isActive: true,
    mode: 'preview',
    primaryColor: '#002395',
    idPlaceholder: '21903456',
    idMinLength: 7,
    idMaxLength: 9,
  },
];

/** The default university ID used for backward compatibility */
export const DEFAULT_UNIVERSITY_ID = 'najah';

/** Get only active universities */
export function getActiveUniversities(): University[] {
  return UNIVERSITIES.filter((u) => u.isActive && u.mode !== 'disabled');
}

/** Find university by id, falls back to najah */
export function getUniversityById(id: string): University {
  return UNIVERSITIES.find((u) => u.id === id) ?? UNIVERSITIES[0];
}

/**
 * Validate whether an email belongs to a university's allowed domains.
 * Supports primary domain and optional altDomain.
 */
export function isValidUniversityEmail(email: string, university: University): boolean {
  const normalized = email.toLowerCase().trim();
  if (normalized.endsWith(`@${university.domain.toLowerCase()}`)) return true;
  if (university.altDomain && normalized.endsWith(`@${university.altDomain.toLowerCase()}`)) return true;
  return false;
}
