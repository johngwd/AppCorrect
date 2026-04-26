import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookMarked,
  BookOpenCheck,
  ChevronDown,
  Download,
  Eraser,
  FileText,
  GraduationCap,
  Languages,
  Lightbulb,
  PenLine,
  Save,
  School,
  Sparkles,
  User,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
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

  const wordCount = useMemo(() => countWords(text), [text]);

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
    <main className="min-h-screen overflow-hidden bg-[#F9FAFB] font-sans text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute right-[-10rem] top-28 h-96 w-96 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 md:gap-7 md:py-8 lg:px-8">
        <Header
          issueCount={issues.length}
          wordCount={wordCount}
          onExport={handleExport}
          onReset={resetDraft}
        />

        <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <ConfigPanel
            metadata={metadata}
            isOpen={isConfigOpen}
            onToggle={() => setIsConfigOpen((isOpen) => !isOpen)}
            onChange={updateMetadata}
          />

          <WritingWorkspace
            text={text}
            issues={issues}
            wordCount={wordCount}
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

/**
 * Compte les mots utiles pour donner a l'eleve un repere simple de progression.
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

type HeaderProps = {
  issueCount: number;
  wordCount: number;
  onExport: () => void;
  onReset: () => void;
};

/**
 * Affiche l'en-tete principal sous forme de hero avec actions rapides et statistiques de redaction.
 */
function Header({ issueCount, wordCount, onExport, onReset }: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 text-white shadow-lg shadow-blue-500/25">
            <BookOpenCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />
              AppCorrect
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Ecrire, comprendre, puis se corriger avec confiance.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Une interface douce et guidee pour rediger un devoir, recevoir des indices rouges, puis progresser sans correction toute faite.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-80">
          <HeroMetric icon={Save} label="Sauvegarde" value="Auto" tone="emerald" />
          <HeroMetric icon={Sparkles} label="Indices" value={String(issueCount)} tone="rose" />
          <HeroMetric icon={PenLine} label="Mots" value={String(wordCount)} tone="blue" />
          <HeroMetric icon={FileText} label="Format" value="A4" tone="slate" />
        </div>
      </div>

      <div className="relative mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
          type="button"
          onClick={onReset}
        >
          <Eraser aria-hidden="true" className="h-4 w-4" />
          Effacer le brouillon
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-200"
          type="button"
          onClick={onExport}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Exporter mon devoir
        </button>
      </div>
    </header>
  );
}

type HeroMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: 'blue' | 'emerald' | 'rose' | 'slate';
};

/**
 * Resume une information importante dans une petite carte lisible depuis mobile.
 */
function HeroMetric({ icon: Icon, label, value, tone }: HeroMetricProps) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-100',
  };

  return (
    <div className={`rounded-2xl p-3 ring-1 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.16em] opacity-75">{label}</span>
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}

type ConfigPanelProps = {
  metadata: StudentMetadata;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof StudentMetadata, value: string) => void;
};

/**
 * Regroupe les informations de configuration dans un accordéon mobile et un panneau lateral soigne.
 */
function ConfigPanel({ metadata, isOpen, onToggle, onChange }: ConfigPanelProps) {
  return (
    <aside className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:sticky lg:top-6 lg:self-start">
      <button
        className="flex w-full items-center justify-between gap-3 p-4 text-left lg:hidden"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="inline-flex items-center gap-3 font-bold">
          <span className="rounded-2xl bg-blue-50 p-2 text-blue-700">
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
          </span>
          Configuration du devoir
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} border-t border-slate-100 p-4 lg:block lg:border-t-0 lg:p-5`}>
        <div className="hidden pb-5 lg:block">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-blue-50 p-2 text-blue-700">
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-950">Configuration</h2>
              <p className="text-sm text-slate-500">Identite et contexte du devoir</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <TextField
            icon={UserRound}
            label="Nom"
            value={metadata.lastName}
            placeholder="Dupont"
            onChange={(value) => onChange('lastName', value)}
          />
          <TextField
            icon={User}
            label="Prenom"
            value={metadata.firstName}
            placeholder="Camille"
            onChange={(value) => onChange('firstName', value)}
          />
          <SelectField
            icon={School}
            label="Classe"
            value={metadata.classLevel}
            options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
            onChange={(value) => onChange('classLevel', value)}
          />
          <TextField
            icon={GraduationCap}
            label="Nom du professeur"
            value={metadata.teacherName}
            placeholder="Mme Martin"
            onChange={(value) => onChange('teacherName', value)}
          />
          <TextField
            icon={BookMarked}
            label="Matiere"
            value={metadata.subject}
            placeholder="Francais"
            onChange={(value) => onChange('subject', value)}
          />
          <SelectField
            icon={Languages}
            label="Langue"
            value={metadata.language}
            options={LANGUAGES}
            onChange={(value) => onChange('language', value as StudentMetadata['language'])}
          />
        </div>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-sm leading-6 text-blue-950">
          <div className="mb-2 flex items-center gap-2 font-bold">
            <Lightbulb aria-hidden="true" className="h-4 w-4 text-blue-700" />
            Astuce pedagogique
          </div>
          Les indices rouges expliquent la regle a verifier, sans donner la reponse, pour favoriser l'autocorrection.
        </div>
      </div>
    </aside>
  );
}

type TextFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/**
 * Champ texte reutilisable avec icone, libelle clair et etat de focus confortable.
 */
function TextField({ icon: Icon, label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="group grid gap-1.5 text-sm font-bold text-slate-700">
      {label}
      <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 shadow-inner shadow-white transition group-focus-within:border-blue-400 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-blue-100">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-blue-600" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

type SelectFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

/**
 * Champ de selection reutilisable avec un design coherent avec les champs texte.
 */
function SelectField({ icon: Icon, label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="group grid gap-1.5 text-sm font-bold text-slate-700">
      {label}
      <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 shadow-inner shadow-white transition group-focus-within:border-blue-400 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-blue-100">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-blue-600" />
        <select
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

type WritingWorkspaceProps = {
  text: string;
  issues: CorrectionIssue[];
  wordCount: number;
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
  wordCount,
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
    <section className="min-w-0 rounded-[2rem] border border-white/80 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            <FileText aria-hidden="true" className="h-4 w-4" />
            Page blanche
          </div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Mon texte</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
          <EditorPill icon={PenLine} label={`${wordCount} mot${wordCount > 1 ? 's' : ''}`} />
          <EditorPill icon={AlertCircle} label={`${issues.length} indice${issues.length > 1 ? 's' : ''}`} />
        </div>
      </div>

      <div className="paper-lines relative min-h-[68vh] overflow-hidden rounded-[1.75rem] bg-white px-4 py-5 shadow-page ring-1 ring-slate-100 sm:px-6 md:px-10 md:py-8">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 opacity-80" />
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

type EditorPillProps = {
  icon: LucideIcon;
  label: string;
};

/**
 * Affiche un repere compact au-dessus de la page de redaction.
 */
function EditorPill({ icon: Icon, label }: EditorPillProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-3 py-2 font-bold text-slate-600 ring-1 ring-slate-200">
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </span>
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
            className={`pointer-events-auto relative rounded px-0.5 text-left text-red-700 decoration-red-500 decoration-2 underline-offset-4 transition hover:bg-red-100 ${
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
    <div className="absolute bottom-4 left-4 right-4 z-30 rounded-3xl border border-red-100 bg-white/95 p-4 shadow-2xl shadow-red-950/10 backdrop-blur sm:left-auto sm:max-w-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="rounded-2xl bg-red-50 p-2 text-red-600">
            <Lightbulb aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
              Indice {issue.category}
            </p>
            <h3 className="mt-1 font-black text-slate-950">{issue.title}</h3>
          </div>
        </div>
        <button
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          type="button"
          aria-label="Fermer l'indice"
          onClick={onClose}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm leading-6 text-slate-700">{issue.message}</p>
    </div>
  );
}
