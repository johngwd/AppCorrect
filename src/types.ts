export type GradeLevel =
  | "CP"
  | "CE1"
  | "CE2"
  | "CM1"
  | "CM2"
  | "6e"
  | "5e"
  | "4e"
  | "3e"
  | "Seconde"
  | "Premiere"
  | "Terminale";

export type LanguageCode = "FR" | "EN" | "ES";

export type StudentMetadata = {
  firstName: string;
  lastName: string;
  classLevel: GradeLevel;
  teacherName: string;
  subject: string;
  language: LanguageCode;
};

export type CorrectionIssue = {
  id: string;
  start: number;
  end: number;
  category:
    | "Majuscule"
    | "Ponctuation"
    | "Orthographe"
    | "Grammaire"
    | "Conjugaison"
    | "Syntaxe";
  title?: string;
  message: string;
  severity: "hint" | "warning";
  level: "primary" | "middle" | "high";
};
