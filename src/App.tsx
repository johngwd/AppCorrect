import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  ChevronDown,
  Download,
  Eraser,
  FileText,
  GraduationCap,
  Save,
  Sparkles,
} from 'lucide-react';
import { analyzeText } from './lib/correctionRules';
import { exportAssignmentPdf } from './lib/pdfExport';
import type { CorrectionIssue, StudentMetadata } from './types';

const STORAGE_KEY = 'appcorrect-draft-v1';

const INITIAL_METADATA: StudentMetadata = {
  lastName: '',
  firstName: '',
  classLevel: 'CP',
  teacherName: '',
  subject: '',
  language: 'FR',
};

const CLASS_LEVELS = [
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

const LANGUAGES = [
  { value: 'FR', label: 'Français' },
  { value: 'EN', label: 'Anglais' },
  { value: 'ES', label: 'Espagnol' },
];

type DraftState = {
  metadata: StudentMetadata;
  text: string;
};

/**
 * Composant racine qui orchestre l'application de redaction, l'analyse pedagogique et la sauvegarde locale.
 */
export default function App() {
  const [initialDraft] = useState(loadDraft);
  const [metadata, setMetadata] = useState<StudentMetadata>(initialDraft.metadata);
  const [text, setText] = useState(initialDraft.text);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    const draft: DraftState = { metadata, text };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [metadata, text]);

  const issues = useMemo(
    () => analyzeText(text, metadata.classLevel, metadata.language),
    [metadata.classLevel, metadata.language, text],
  );

  /**
   * Met a jour une information d'identite sans toucher aux autres champs du formulaire.
   */
  const updateMetadata = (field: keyof StudentMetadata, value: string) => {
    setMetadata((currentMetadata) => ({
      ...currentMetadata,
      [field]: value,
    }));
  };

  /**
   * Efface le brouillon local afin que l'eleve puisse repartir d'une page vierge.
   */
  const resetDraft = () => {
    setMetadata(INITIAL_METADATA);
    setText('');
    setSelectedIssueId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Genere un PDF A4 propre avec l'identite de l'eleve et le texte en interligne large.
   */
  const handleExport = () => {
    exportAssignmentPdf(metadata, text);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <Header
          issueCount={issues.length}
          onExport={handleExport}
          onReset={resetDraft}
        />

        <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <ConfigPanel
            metadata={metadata}
            isOpen={isConfigOpen}
            onToggle={() => setIsConfigOpen((isOpen) => !isOpen)}
            onChange={updateMetadata}
          />

          <WritingWorkspace
            text={text}
            issues={issues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={setSelectedIssueId}
            onTextChange={(event) => setText(event.target.value)}
          />
        </section>
      </div>
    </main>
  );
}

/**
 * Charge le brouillon sauvegarde au demarrage sans declencher de rendu intermediaire.
 */
function loadDraft(): DraftState {
  const savedDraft = localStorage.getItem(STORAGE_KEY);

  if (!savedDraft) {
    return { metadata: INITIAL_METADATA, text: '' };
  }

  try {
    const parsedDraft = JSON.parse(savedDraft) as DraftState;
    return {
      metadata: { ...INITIAL_METADATA, ...parsedDraft.metadata },
      text: parsedDraft.text ?? '',
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { metadata: INITIAL_METADATA, text: '' };
  }
}

type HeaderProps = {
  issueCount: number;
  onExport: () => void;
  onReset: () => void;
};

/**
 * Affiche l'en-tete principal avec les actions de sauvegarde visible, d'export et de remise a zero.
 */
function Header({ issueCount, onExport, onReset }: HeaderProps) {
  return (
    <header className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-sm">
            <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              AppCorrect
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Redaction et autocorrection pedagogique
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Ecris ton devoir, repere les indices rouges, puis corrige-toi grace a des rappels de regles.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <Save aria-hidden="true" className="h-4 w-4" />
            Sauvegarde auto
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {issueCount} indice{issueCount > 1 ? 's' : ''}
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            type="button"
            onClick={onReset}
          >
            <Eraser aria-hidden="true" className="h-4 w-4" />
            Effacer
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            type="button"
            onClick={onExport}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Exporter mon devoir
          </button>
        </div>
      </div>
    </header>
  );
}

type ConfigPanelProps = {
  metadata: StudentMetadata;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof StudentMetadata, value: string) => void;
};

/**
 * Regroupe les informations de configuration dans un accordéon mobile et un panneau fixe sur grand ecran.
 */
function ConfigPanel({ metadata, isOpen, onToggle, onChange }: ConfigPanelProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
      <button
        className="flex w-full items-center justify-between gap-3 p-4 text-left lg:hidden"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <GraduationCap aria-hidden="true" className="h-5 w-5 text-blue-600" />
          Configuration du devoir
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} border-t border-slate-100 p-4 lg:block lg:border-t-0 lg:p-5`}>
        <div className="hidden items-center gap-2 pb-4 font-semibold lg:flex">
          <GraduationCap aria-hidden="true" className="h-5 w-5 text-blue-600" />
          Configuration du devoir
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <TextField
            label="Nom"
            value={metadata.lastName}
            placeholder="Dupont"
            onChange={(value) => onChange('lastName', value)}
          />
          <TextField
            label="Prenom"
            value={metadata.firstName}
            placeholder="Camille"
            onChange={(value) => onChange('firstName', value)}
          />
          <SelectField
            label="Classe"
            value={metadata.classLevel}
            options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
            onChange={(value) => onChange('classLevel', value)}
          />
          <TextField
            label="Nom du professeur"
            value={metadata.teacherName}
            placeholder="Mme Martin"
            onChange={(value) => onChange('teacherName', value)}
          />
          <TextField
            label="Matiere"
            value={metadata.subject}
            placeholder="Francais"
            onChange={(value) => onChange('subject', value)}
          />
          <SelectField
            label="Langue"
            value={metadata.language}
            options={LANGUAGES}
            onChange={(value) => onChange('language', value as StudentMetadata['language'])}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Les indices rouges n'affichent pas la correction directement: ils guident vers la regle a verifier.
        </div>
      </div>
    </aside>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/**
 * Champ texte reutilisable avec libelle clair pour les metadonnees du devoir.
 */
function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

/**
 * Champ de selection reutilisable pour les options normalisees comme la classe ou la langue.
 */
function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <select
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type WritingWorkspaceProps = {
  text: string;
  issues: CorrectionIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
  onTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

/**
 * Affiche l'editeur principal et la couche de surlignage qui rend les erreurs cliquables.
 */
function WritingWorkspace({
  text,
  issues,
  selectedIssueId,
  onSelectIssue,
  onTextChange,
}: WritingWorkspaceProps) {
  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) ?? null;

  useEffect(() => {
    if (selectedIssueId && !selectedIssue) {
      onSelectIssue(null);
    }
  }, [onSelectIssue, selectedIssue, selectedIssueId]);

  return (
    <section className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <FileText aria-hidden="true" className="h-4 w-4" />
            Page blanche
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Mon texte</h2>
        </div>
        <p className="text-sm text-slate-500">
          Clique sur un passage rouge pour afficher l'indice de correction.
        </p>
      </div>

      <div className="relative min-h-[68vh] rounded-3xl bg-white px-4 py-5 shadow-page ring-1 ring-slate-100 sm:px-6 md:px-10 md:py-8">
        <textarea
          className="relative z-10 min-h-[58vh] w-full resize-none bg-transparent font-serif text-lg leading-8 text-transparent caret-blue-700 outline-none selection:bg-blue-100 sm:text-xl sm:leading-9"
          aria-label="Zone de redaction"
          spellCheck="false"
          value={text}
          placeholder="Commence a rediger ton devoir ici..."
          onChange={onTextChange}
        />

        <HighlightedText
          text={text}
          issues={issues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={onSelectIssue}
        />

        {selectedIssue && (
          <IssueTooltip issue={selectedIssue} onClose={() => onSelectIssue(null)} />
        )}
      </div>
    </section>
  );
}

type HighlightedTextProps = {
  text: string;
  issues: CorrectionIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
};

/**
 * Convertit le texte analyse en segments visuels afin de souligner uniquement les zones detectees.
 */
function HighlightedText({ text, issues, selectedIssueId, onSelectIssue }: HighlightedTextProps) {
  const segments = buildHighlightedSegments(text, issues);

  if (!text) {
    return (
      <div className="pointer-events-none absolute inset-0 px-4 py-5 font-serif text-lg leading-8 text-slate-400 sm:text-xl sm:leading-9 md:px-10 md:py-8">
        Commence a rediger ton devoir ici...
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 whitespace-pre-wrap break-words px-4 py-5 font-serif text-lg leading-8 text-slate-900 sm:text-xl sm:leading-9 md:px-10 md:py-8"
      aria-hidden="true"
    >
      {segments.map((segment) => {
        if (!segment.issue) {
          return <span key={segment.key}>{segment.content}</span>;
        }

        const issue = segment.issue;
        const isSelected = issue.id === selectedIssueId;

        return (
          <button
            key={segment.key}
            className={`pointer-events-auto relative rounded px-0.5 text-left text-red-700 decoration-red-500 decoration-2 underline-offset-4 transition ${
              isSelected ? 'bg-red-100 underline' : 'bg-red-50 underline decoration-wavy'
            }`}
            type="button"
            onClick={() => onSelectIssue(issue.id)}
          >
            {segment.content}
          </button>
        );
      })}
    </div>
  );
}

type HighlightedSegment = {
  key: string;
  content: string;
  issue: CorrectionIssue | null;
};

/**
 * Fabrique des segments de texte non chevauchants pour aligner le rendu colore sur l'analyse.
 */
function buildHighlightedSegments(text: string, issues: CorrectionIssue[]): HighlightedSegment[] {
  const sortedIssues = [...issues].sort((a, b) => a.start - b.start);
  const segments: HighlightedSegment[] = [];
  let cursor = 0;

  sortedIssues.forEach((issue, index) => {
    if (issue.start < cursor) {
      return;
    }

    if (issue.start > cursor) {
      segments.push({
        key: `text-${cursor}-${issue.start}`,
        content: text.slice(cursor, issue.start),
        issue: null,
      });
    }

    segments.push({
      key: `issue-${issue.id}-${index}`,
      content: text.slice(issue.start, issue.end),
      issue,
    });
    cursor = issue.end;
  });

  if (cursor < text.length) {
    segments.push({
      key: `text-${cursor}-end`,
      content: text.slice(cursor),
      issue: null,
    });
  }

  return segments;
}

type IssueTooltipProps = {
  issue: CorrectionIssue;
  onClose: () => void;
};

/**
 * Presente l'explication pedagogique sans donner la reponse afin d'encourager l'autocorrection.
 */
function IssueTooltip({ issue, onClose }: IssueTooltipProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-red-100 bg-white p-4 shadow-xl sm:left-auto sm:max-w-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
            Indice {issue.category}
          </p>
          <h3 className="mt-1 font-semibold text-slate-950">{issue.title}</h3>
        </div>
        <button
          className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          type="button"
          onClick={onClose}
        >
          Fermer
        </button>
      </div>
      <p className="text-sm leading-6 text-slate-700">{issue.message}</p>
    </div>
  );
}
