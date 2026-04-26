import type { CorrectionIssue, GradeLevel, LanguageCode } from "../types";

type RuleContext = {
  grade: GradeLevel;
  language: LanguageCode;
};

type CorrectionRule = {
  id: string;
  label: string;
  appliesTo: LanguageCode[];
  minGrade?: GradeLevel;
  run: (text: string, context: RuleContext) => CorrectionIssue[];
};

const gradeOrder: GradeLevel[] = [
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "6e",
  "5e",
  "4e",
  "3e",
  "Seconde",
  "Premiere",
  "Terminale",
];

const commonFrenchConfusions: Array<{ pattern: RegExp; explanation: string }> = [
  {
    pattern: /\b(sa)\s+(?:va|fait|semble|devient)\b/gi,
    explanation:
      "Interroge-toi sur le sens: ici, on attend souvent le verbe etre ou un pronom demonstratif, pas un determinant possessif.",
  },
  {
    pattern: /\b(a)\s+(?:la|le|les|l')/gi,
    explanation:
      "Verifie si tu peux remplacer par avait. Si oui, il s'agit du verbe avoir; sinon, il faut peut-etre un mot avec accent.",
  },
  {
    pattern: /\b(et)\s+(?:je|tu|il|elle|nous|vous|ils|elles)\b/gi,
    explanation:
      "Demande-toi si le mot relie deux elements ou s'il correspond au verbe etre. Le sens de la phrase aide a choisir.",
  },
];

const suspiciousSpellings: Array<{ pattern: RegExp; explanation: string }> = [
  {
    pattern: /\b(beaucoups|parmis|malgres|aujourdhui|daccord)\b/gi,
    explanation:
      "Ce mot fait partie des orthographes frequemment confondues. Relis-le syllabe par syllabe et verifie les lettres muettes ou l'apostrophe.",
  },
  {
    pattern: /\b(recus|apercus|connus)\b/gi,
    explanation:
      "Attention aux accents dans certains participes passes. Cherche la forme du verbe a l'infinitif pour t'aider.",
  },
];

const rules: CorrectionRule[] = [
  {
    id: "sentence-capital",
    label: "Majuscule en debut de phrase",
    appliesTo: ["FR", "EN", "ES"],
    run(text) {
      const issues: CorrectionIssue[] = [];
      const sentenceStart = /(^|[.!?]\s+)([a-zàâçéèêëîïôûùüÿñ])/g;
      let match: RegExpExecArray | null;

      while ((match = sentenceStart.exec(text))) {
        const prefixLength = match[1]?.length ?? 0;
        const start = match.index + prefixLength;
        issues.push({
          id: `capital-${start}`,
          start,
          end: start + match[2].length,
          category: "Majuscule",
          message:
            "Une phrase commence par une majuscule. Relis le debut de cette phrase et corrige la premiere lettre.",
          severity: "warning",
        });
      }

      return issues;
    },
  },
  {
    id: "missing-final-punctuation",
    label: "Ponctuation finale",
    appliesTo: ["FR", "EN", "ES"],
    run(text) {
      const trimmed = text.trimEnd();
      if (!trimmed || /[.!?…]$/.test(trimmed)) {
        return [];
      }

      return [
        {
          id: "final-punctuation",
          start: Math.max(trimmed.length - 1, 0),
          end: trimmed.length,
          category: "Ponctuation",
          message:
            "Une phrase terminee aide le lecteur. Verifie si ton texte doit finir par un point, un point d'interrogation ou un point d'exclamation.",
          severity: "hint",
        },
      ];
    },
  },
  {
    id: "space-before-punctuation",
    label: "Espaces avant ponctuation forte",
    appliesTo: ["FR"],
    run(text) {
      return collectMatches(text, /[^\s][;:!?]/g, (match, start) => ({
        id: `space-punctuation-${start}`,
        start: start + match[0].length - 1,
        end: start + match[0].length,
        category: "Ponctuation",
        message:
          "En francais, les signes : ; ! ? sont precedes d'une espace. Observe le signe et ajoute l'espace necessaire.",
        severity: "hint",
      }));
    },
  },
  {
    id: "repeated-punctuation",
    label: "Ponctuation repetee",
    appliesTo: ["FR", "EN", "ES"],
    run(text) {
      return collectMatches(text, /([!?.,])\1{1,}/g, (match, start) => ({
        id: `repeated-punctuation-${start}`,
        start,
        end: start + match[0].length,
        category: "Ponctuation",
        message:
          "Une ponctuation repetee peut rendre le texte moins clair. Choisis le signe le plus juste pour ton intention.",
        severity: "hint",
      }));
    },
  },
  {
    id: "repeated-word",
    label: "Mot repete",
    appliesTo: ["FR", "EN", "ES"],
    run(text) {
      return collectMatches(
        text,
        /\b([A-Za-zÀ-ÖØ-öø-ÿÑñ]+)\s+\1\b/gi,
        (match, start) => ({
          id: `repeated-word-${start}`,
          start,
          end: start + match[0].length,
          category: "Syntaxe",
          message:
            "Deux mots identiques se suivent. Relis la phrase pour verifier si cette repetition est volontaire.",
          severity: "warning",
        }),
      );
    },
  },
  {
    id: "french-common-confusions",
    label: "Homophones courants",
    appliesTo: ["FR"],
    minGrade: "CE2",
    run(text) {
      return commonFrenchConfusions.flatMap(({ pattern, explanation }, index) =>
        collectMatches(text, pattern, (match, start) => ({
          id: `homophone-${index}-${start}`,
          start,
          end: start + match[1].length,
          category: "Grammaire",
          message: explanation,
          severity: "warning",
        })),
      );
    },
  },
  {
    id: "french-subject-verb-agreement",
    label: "Accord sujet-verbe",
    appliesTo: ["FR"],
    minGrade: "CM1",
    run(text) {
      return collectMatches(
        text,
        /\b(ils|elles|mes amis|les enfants|nous)\s+([a-zàâçéèêëîïôûùüÿ]+e)\b/gi,
        (match, start) => ({
          id: `agreement-${start}`,
          start: start + match[0].indexOf(match[2]),
          end: start + match[0].indexOf(match[2]) + match[2].length,
          category: "Conjugaison",
          message:
            "Le sujet semble au pluriel. Verifie la terminaison du verbe et demande-toi si elle s'accorde avec le sujet.",
          severity: "warning",
        }),
      );
    },
  },
  {
    id: "suspicious-spellings",
    label: "Orthographe lexicale",
    appliesTo: ["FR"],
    minGrade: "CE1",
    run(text) {
      return suspiciousSpellings.flatMap(({ pattern, explanation }, index) =>
        collectMatches(text, pattern, (match, start) => ({
          id: `spelling-${index}-${start}`,
          start,
          end: start + match[0].length,
          category: "Orthographe",
          message: explanation,
          severity: "warning",
        })),
      );
    },
  },
  {
    id: "long-sentence",
    label: "Phrase longue",
    appliesTo: ["FR", "EN", "ES"],
    minGrade: "6e",
    run(text) {
      const issues: CorrectionIssue[] = [];
      const sentencePattern = /[^.!?]+[.!?]?/g;
      let match: RegExpExecArray | null;

      while ((match = sentencePattern.exec(text))) {
        const sentence = match[0].trim();
        const words = sentence.split(/\s+/).filter(Boolean);
        if (words.length >= 34) {
          const start = match.index + Math.max(match[0].indexOf(sentence), 0);
          issues.push({
            id: `long-sentence-${start}`,
            start,
            end: start + sentence.length,
            category: "Syntaxe",
            message:
              "Cette phrase est longue. Cherche les idees principales et vois si une ponctuation peut clarifier le raisonnement.",
            severity: "hint",
          });
        }
      }

      return issues;
    },
  },
];

/** Analyse un texte avec des regles extensibles selon la langue et le niveau scolaire. */
export function analyzeText(
  text: string,
  grade: GradeLevel,
  language: LanguageCode,
): CorrectionIssue[] {
  const context = { grade, language };

  return rules
    .filter((rule) => rule.appliesTo.includes(language))
    .filter((rule) => !rule.minGrade || isGradeAtLeast(grade, rule.minGrade))
    .flatMap((rule) => rule.run(text, context))
    .sort((first, second) => first.start - second.start || first.end - second.end)
    .filter((issue, index, allIssues) => {
      const previous = allIssues[index - 1];
      return !previous || previous.start !== issue.start || previous.end !== issue.end;
    })
    .map((issue) => ({
      ...issue,
      title: issue.title ?? buildIssueTitle(issue.category),
    }));
}

/** Compare deux niveaux pour activer progressivement les regles pedagogiques. */
function isGradeAtLeast(current: GradeLevel, minimum: GradeLevel): boolean {
  return gradeOrder.indexOf(current) >= gradeOrder.indexOf(minimum);
}

/** Produit un titre court et comprehensible pour chaque bulle d'indice. */
function buildIssueTitle(category: CorrectionIssue["category"]): string {
  const titles: Record<CorrectionIssue["category"], string> = {
    Majuscule: "Observe le debut de la phrase",
    Ponctuation: "Verifie le signe de ponctuation",
    Orthographe: "Relis l'orthographe du mot",
    Grammaire: "Questionne le role du mot",
    Conjugaison: "Accorde le verbe avec son sujet",
    Syntaxe: "Clarifie la construction de la phrase",
  };

  return titles[category];
}

/** Transforme les correspondances d'une expression reguliere en problemes pedagogiques. */
function collectMatches(
  text: string,
  pattern: RegExp,
  createIssue: (match: RegExpExecArray, start: number) => CorrectionIssue,
): CorrectionIssue[] {
  const issues: CorrectionIssue[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    issues.push(createIssue(match, match.index));
  }

  return issues;
}
