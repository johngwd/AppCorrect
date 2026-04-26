import type { GradeLevel, LanguageCode, StudentMetadata } from './types';

/** Cle unique utilisee pour retrouver le brouillon dans le stockage local du navigateur. */
export const STORAGE_KEY = 'correcteur-academique-draft-v1';

/** Valeurs par defaut du formulaire pour garantir un etat initial stable. */
export const INITIAL_METADATA: StudentMetadata = {
  lastName: '',
  firstName: '',
  classLevel: 'CP',
  teacherName: '',
  subject: '',
  language: 'FR',
};

/** Liste ordonnee des niveaux disponibles dans l'interface. */
export const CLASS_LEVELS: GradeLevel[] = [
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6e',
  '5e',
  '4e',
  '3e',
  'Seconde',
  'Premiere',
  'Terminale',
];

/** Options de langue proposees pour changer le dictionnaire de correction. */
export const LANGUAGES: Array<{ value: LanguageCode; label: string }> = [
  { value: 'FR', label: 'Français' },
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
];
