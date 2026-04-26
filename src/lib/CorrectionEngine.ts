import type { CorrectionIssue, GradeLevel, LanguageCode } from '../types';

type CorrectionRule = {
  id: string;
  category: CorrectionIssue['category'];
  appliesTo: LanguageCode[];
  minGrade?: GradeLevel;
  run: (text: string, context: CorrectionContext) => CorrectionIssue[];
};

type CorrectionContext = {
  level: GradeLevel;
  lang: LanguageCode;
};

const GRADE_ORDER: GradeLevel[] = [
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

const PRIMARY_LEVELS: GradeLevel[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const SECONDARY_LEVELS: GradeLevel[] = ['6e', '5e', '4e', '3e'];

const COMMON_SPELLINGS: Record<LanguageCode, Array<{ pattern: RegExp; label: string }>> = {
  FR: [
    { pattern: /\b(beaucoups|parmis|malgres|aujourdhui|daccord)\b/gi, label: 'mot courant' },
    { pattern: /\b(recus|apercus|connus)\b/gi, label: 'forme avec accent possible' },
  ],
  EN: [
    { pattern: /\b(recieve|seperate|definately|adress)\b/gi, label: 'common spelling' },
    { pattern: /\b(i)\b/g, label: 'personal pronoun' },
  ],
  ES: [
    { pattern: /\b(tambien|facil|dificil|porque)\b/gi, label: 'palabra frecuente' },
    { pattern: /\b(el)\s+(?:agua|aula)\b/gi, label: 'determinante especial' },
  ],
};

const ISSUE_TITLES: Record<CorrectionIssue['category'], string> = {
  Majuscule: 'Observe le debut de la phrase',
  Ponctuation: 'Verifie le signe de ponctuation',
  Orthographe: "Relis l'orthographe du mot",
  Grammaire: 'Questionne le role du mot',
  Conjugaison: 'Accorde le verbe avec son sujet',
  Syntaxe: 'Clarifie la construction de la phrase',
};

const RULES: CorrectionRule[] = [
  {
    id: 'capital-start',
    category: 'Majuscule',
    appliesTo: ['FR', 'EN', 'ES'],
    run(text, context) {
      const pattern = /(^|[.!?]\s+)([a-zàâçéèêëîïôûùüÿñáéíóú])/g;
      return collectMatches(text, pattern, (match, start) => {
        const prefixLength = match[1]?.length ?? 0;
        const issueStart = start + prefixLength;

        return createIssue({
          id: `capital-${issueStart}`,
          start: issueStart,
          end: issueStart + match[2].length,
          category: 'Majuscule',
          context,
        });
      });
    },
  },
  {
    id: 'final-punctuation',
    category: 'Ponctuation',
    appliesTo: ['FR', 'EN', 'ES'],
    run(text, context) {
      const trimmed = text.trimEnd();

      if (!trimmed || /[.!?…]$/.test(trimmed)) {
        return [];
      }

      return [
        createIssue({
          id: 'final-punctuation',
          start: Math.max(trimmed.length - 1, 0),
          end: trimmed.length,
          category: 'Ponctuation',
          context,
          severity: 'hint',
        }),
      ];
    },
  },
  {
    id: 'repeated-punctuation',
    category: 'Ponctuation',
    appliesTo: ['FR', 'EN', 'ES'],
    run(text, context) {
      return collectMatches(text, /([!?.,])\1{1,}/g, (match, start) =>
        createIssue({
          id: `repeated-punctuation-${start}`,
          start,
          end: start + match[0].length,
          category: 'Ponctuation',
          context,
          severity: 'hint',
        }),
      );
    },
  },
  {
    id: 'french-strong-punctuation-space',
    category: 'Ponctuation',
    appliesTo: ['FR'],
    run(text, context) {
      return collectMatches(text, /[^\s][;:!?]/g, (match, start) =>
        createIssue({
          id: `space-before-punctuation-${start}`,
          start: start + match[0].length - 1,
          end: start + match[0].length,
          category: 'Ponctuation',
          context,
          severity: 'hint',
        }),
      );
    },
  },
  {
    id: 'repeated-word',
    category: 'Syntaxe',
    appliesTo: ['FR', 'EN', 'ES'],
    run(text, context) {
      return collectMatches(text, /\b([A-Za-zÀ-ÖØ-öø-ÿÑñ]+)\s+\1\b/gi, (match, start) =>
        createIssue({
          id: `repeated-word-${start}`,
          start,
          end: start + match[0].length,
          category: 'Syntaxe',
          context,
        }),
      );
    },
  },
  {
    id: 'common-spellings',
    category: 'Orthographe',
    appliesTo: ['FR', 'EN', 'ES'],
    minGrade: 'CE1',
    run(text, context) {
      return COMMON_SPELLINGS[context.lang].flatMap(({ pattern, label }, index) =>
        collectMatches(text, pattern, (match, start) =>
          createIssue({
            id: `spelling-${context.lang}-${index}-${start}`,
            start,
            end: start + match[0].length,
            category: 'Orthographe',
            context,
            detail: label,
          }),
        ),
      );
    },
  },
  {
    id: 'french-subject-verb-agreement',
    category: 'Conjugaison',
    appliesTo: ['FR'],
    minGrade: 'CM1',
    run(text, context) {
      return collectMatches(
        text,
        /\b(ils|elles|nous|les enfants|mes amis)\s+([a-zàâçéèêëîïôûùüÿ]+e)\b/gi,
        (match, start) => {
          const verbStart = start + match[0].indexOf(match[2]);
          return createIssue({
            id: `fr-agreement-${start}`,
            start: verbStart,
            end: verbStart + match[2].length,
            category: 'Conjugaison',
            context,
          });
        },
      );
    },
  },
  {
    id: 'english-third-person',
    category: 'Conjugaison',
    appliesTo: ['EN'],
    minGrade: 'CM1',
    run(text, context) {
      return collectMatches(text, /\b(he|she|it)\s+(go|play|work|like|want)\b/gi, (match, start) => {
        const verbStart = start + match[0].indexOf(match[2]);
        return createIssue({
          id: `en-third-person-${start}`,
          start: verbStart,
          end: verbStart + match[2].length,
          category: 'Conjugaison',
          context,
        });
      });
    },
  },
  {
    id: 'spanish-plural-agreement',
    category: 'Grammaire',
    appliesTo: ['ES'],
    minGrade: 'CM1',
    run(text, context) {
      return collectMatches(text, /\b(los|las|mis|tus)\s+([a-záéíóúñ]+[^s\s])\b/gi, (match, start) => {
        const wordStart = start + match[0].indexOf(match[2]);
        return createIssue({
          id: `es-plural-${start}`,
          start: wordStart,
          end: wordStart + match[2].length,
          category: 'Grammaire',
          context,
        });
      });
    },
  },
  {
    id: 'long-sentence',
    category: 'Syntaxe',
    appliesTo: ['FR', 'EN', 'ES'],
    minGrade: '6e',
    run(text, context) {
      const issues: CorrectionIssue[] = [];
      const pattern = /[^.!?]+[.!?]?/g;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(text))) {
        const sentence = match[0].trim();
        const words = sentence.split(/\s+/).filter(Boolean);

        if (words.length >= getLongSentenceLimit(context.level)) {
          const sentenceStart = match.index + Math.max(match[0].indexOf(sentence), 0);
          issues.push(
            createIssue({
              id: `long-sentence-${sentenceStart}`,
              start: sentenceStart,
              end: sentenceStart + sentence.length,
              category: 'Syntaxe',
              context,
              severity: 'hint',
            }),
          );
        }
      }

      return issues;
    },
  },
];

/** Analyse le texte sans API externe avec des regles locales extensibles par langue et niveau. */
export function checkText(text: string, level: GradeLevel, lang: LanguageCode): CorrectionIssue[] {
  const context: CorrectionContext = { level, lang };

  if (!text.trim()) {
    return [];
  }

  return RULES.filter((rule) => rule.appliesTo.includes(lang))
    .filter((rule) => !rule.minGrade || isGradeAtLeast(level, rule.minGrade))
    .flatMap((rule) => rule.run(text, context))
    .sort((first, second) => first.start - second.start || first.end - second.end)
    .filter((issue, index, issues) => {
      const previous = issues[index - 1];
      return !previous || previous.start !== issue.start || previous.end !== issue.end;
    });
}

/** Garde l'ancien nom d'export pour les appels existants et facilite une future migration. */
export const analyzeText = checkText;

/** Convertit une expression reguliere en liste d'indices sans parcourir le texte plusieurs fois inutilement. */
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

/** Centralise la creation des messages pour garantir qu'aucune bulle ne donne la correction exacte. */
function createIssue({
  id,
  start,
  end,
  category,
  context,
  severity = 'warning',
  detail,
}: {
  id: string;
  start: number;
  end: number;
  category: CorrectionIssue['category'];
  context: CorrectionContext;
  severity?: CorrectionIssue['severity'];
  detail?: string;
}): CorrectionIssue {
  return {
    id,
    start,
    end,
    category,
    title: ISSUE_TITLES[category],
    message: buildPedagogicalHint(category, context, detail),
    severity,
    level: getLevelBand(context.level),
  };
}

/** Adapte la granularite de l'indice a l'age suppose de l'eleve. */
function buildPedagogicalHint(
  category: CorrectionIssue['category'],
  context: CorrectionContext,
  detail?: string,
): string {
  const levelBand = getLevelBand(context.level);
  const hints = HINTS[context.lang][category];
  return hints[levelBand].replace('{detail}', detail ?? 'ce passage');
}

/** Regroupe les classes pour moduler la complexite grammaticale des explications. */
function getLevelBand(level: GradeLevel): 'primary' | 'middle' | 'high' {
  if (PRIMARY_LEVELS.includes(level)) {
    return 'primary';
  }

  if (SECONDARY_LEVELS.includes(level)) {
    return 'middle';
  }

  return 'high';
}

/** Compare deux niveaux scolaires dans l'ordre pedagogique de l'application. */
function isGradeAtLeast(current: GradeLevel, minimum: GradeLevel): boolean {
  return GRADE_ORDER.indexOf(current) >= GRADE_ORDER.indexOf(minimum);
}

/** Rend le seuil de phrase longue plus exigeant au lycee. */
function getLongSentenceLimit(level: GradeLevel): number {
  return getLevelBand(level) === 'high' ? 42 : 34;
}

const HINTS: Record<
  LanguageCode,
  Record<CorrectionIssue['category'], Record<'primary' | 'middle' | 'high', string>>
> = {
  FR: {
    Majuscule: {
      primary: 'Une phrase commence souvent par une grande lettre. Regarde la premiere lettre.',
      middle: 'Apres un point, une phrase commence par une majuscule. Verifie le debut de la proposition.',
      high: 'Verifie la norme typographique: debut de phrase, nom propre ou reprise apres ponctuation forte.',
    },
    Ponctuation: {
      primary: 'Lis ta phrase a voix haute: a-t-elle besoin de respirer ou de se terminer?',
      middle: 'La ponctuation organise le sens. Controle le signe choisi et les espaces autour de lui.',
      high: 'Interroge la valeur syntaxique du signe: cloture, interrogation, emphase ou articulation logique.',
    },
    Orthographe: {
      primary: 'Ce mot semble fragile. Regarde les sons, les lettres muettes et les accents.',
      middle: 'Ce {detail} merite une verification: famille de mots, accents ou graphie frequente.',
      high: 'Analyse la graphie de {detail}: etymologie, accentuation, lettres finales et usage lexical.',
    },
    Grammaire: {
      primary: 'Demande-toi qui fait l action et de quel mot on parle.',
      middle: 'Identifie la nature du mot et son lien avec les autres mots du groupe.',
      high: 'Verifie la fonction grammaticale et les relations d accord dans le groupe syntaxique.',
    },
    Conjugaison: {
      primary: 'Cherche le sujet: est-il seul ou y a-t-il plusieurs personnes?',
      middle: 'Le sujet guide la terminaison du verbe. Verifie personne, nombre et temps.',
      high: 'Controle la concordance sujet-verbe: personne, nombre, temps et mode attendu.',
    },
    Syntaxe: {
      primary: 'Relis doucement: deux mots se suivent-ils bizarrement?',
      middle: 'Observe l ordre des mots et la longueur de la phrase pour clarifier l idee.',
      high: 'Interroge la structure de la phrase: enchassements, repetitions et lisibilite argumentative.',
    },
  },
  EN: {
    Majuscule: {
      primary: 'A sentence starts with a capital letter. Look at the first letter.',
      middle: 'After a full stop, check that the new sentence starts with a capital letter.',
      high: 'Check capitalization conventions: sentence opening, proper nouns and pronoun usage.',
    },
    Ponctuation: {
      primary: 'Read it aloud: does the sentence need an ending mark?',
      middle: 'Punctuation helps the reader follow your idea. Check the chosen sign.',
      high: 'Review punctuation for sentence boundary, emphasis and logical rhythm.',
    },
    Orthographe: {
      primary: 'This word may need checking. Look carefully at each letter.',
      middle: 'This {detail} is often confused. Check the spelling pattern.',
      high: 'Review the spelling of {detail}: vowel order, doubled letters and standard usage.',
    },
    Grammaire: {
      primary: 'Ask who or what the sentence is about.',
      middle: 'Check how this word works with the words around it.',
      high: 'Review grammatical role, agreement and phrase structure.',
    },
    Conjugaison: {
      primary: 'Find the subject first. Is it he, she or it?',
      middle: 'The subject can change the verb form. Check the ending.',
      high: 'Verify subject-verb agreement and tense consistency.',
    },
    Syntaxe: {
      primary: 'Read the sentence slowly and listen for repeated words.',
      middle: 'Check word order and sentence length for clarity.',
      high: 'Review sentence structure, repetition and argumentative clarity.',
    },
  },
  ES: {
    Majuscule: {
      primary: 'Una frase empieza con mayuscula. Mira la primera letra.',
      middle: 'Despues de un punto, comprueba que la nueva frase empiece con mayuscula.',
      high: 'Revisa las convenciones de mayusculas: inicio, nombres propios y puntuacion fuerte.',
    },
    Ponctuation: {
      primary: 'Lee la frase en voz alta: necesita un signo al final?',
      middle: 'La puntuacion ayuda a ordenar la idea. Comprueba el signo elegido.',
      high: 'Analiza el valor del signo: cierre, pregunta, enfasis o relacion logica.',
    },
    Orthographe: {
      primary: 'Esta palabra merece una mirada: revisa letras y tildes.',
      middle: 'Comprueba {detail}: acentos, letras finales y grafia habitual.',
      high: 'Verifica la ortografia de {detail}: acentuacion, morfologia y uso academico.',
    },
    Grammaire: {
      primary: 'Mira si las palabras van juntas: una o varias?',
      middle: 'Comprueba genero y numero dentro del grupo de palabras.',
      high: 'Revisa concordancia nominal, funcion y cohesion del grupo sintactico.',
    },
    Conjugaison: {
      primary: 'Busca quien hace la accion.',
      middle: 'El sujeto guia la forma del verbo. Comprueba persona y numero.',
      high: 'Verifica concordancia verbal, tiempo y modo en el contexto.',
    },
    Syntaxe: {
      primary: 'Lee despacio: hay una repeticion o una frase muy larga?',
      middle: 'Observa el orden de palabras y la longitud de la frase.',
      high: 'Evalua estructura, subordinacion, repeticion y claridad argumentativa.',
    },
  },
};
