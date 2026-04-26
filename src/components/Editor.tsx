import { AlertCircle, FileText, PenLine } from 'lucide-react';
import type { CorrectionIssue } from '../types';

type EditorProps = {
  text: string;
  issues: CorrectionIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
  onTextChange: (value: string) => void;
};

/**
 * Affiche la feuille A4 interactive et coordonne la saisie avec la couche de surlignage.
 */
export function Editor({
  text,
  issues,
  selectedIssueId,
  onSelectIssue,
  onTextChange,
}: EditorProps) {
  const wordCount = countWords(text);

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm ring-1 ring-slate-200">
            <FileText aria-hidden="true" className="h-4 w-4" />
            Feuille A4
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Espace de rédaction</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
          <EditorPill icon={PenLine} label={`${wordCount} mot${wordCount > 1 ? 's' : ''}`} />
          <EditorPill icon={AlertCircle} label={`${issues.length} indice${issues.length > 1 ? 's' : ''}`} />
        </div>
      </div>

      <div className="relative mx-auto min-h-[72vh] max-w-[900px] overflow-hidden rounded-[2rem] bg-white px-5 py-8 shadow-a4 ring-1 ring-slate-200/70 sm:px-10 md:px-16 md:py-12">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200" />
        <div className="pointer-events-none absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-rose-100 md:block" />

        <textarea
          className="relative z-10 min-h-[62vh] w-full resize-none bg-transparent font-serif text-lg leading-8 text-transparent caret-slate-900 outline-none selection:bg-blue-100 sm:text-xl sm:leading-9"
          aria-label="Zone de rédaction"
          spellCheck="false"
          value={text}
          placeholder="Commence à rédiger ton devoir ici..."
          onChange={(event) => onTextChange(event.target.value)}
        />

        <HighlightedText
          text={text}
          issues={issues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={onSelectIssue}
        />

      </div>
    </section>
  );
}

type EditorPillProps = {
  icon: typeof PenLine;
  label: string;
};

/**
 * Présente une métrique de rédaction dans un badge compact.
 */
function EditorPill({ icon: Icon, label }: EditorPillProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
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
 * Transforme les erreurs en segments cliquables sans recalcul coûteux à chaque rendu de mot.
 */
function HighlightedText({ text, issues, selectedIssueId, onSelectIssue }: HighlightedTextProps) {
  const segments = buildHighlightedSegments(text, issues);

  if (!text) {
    return (
      <div className="pointer-events-none absolute inset-0 px-5 py-8 font-serif text-lg leading-8 text-slate-400 sm:px-10 sm:text-xl sm:leading-9 md:px-16 md:py-12">
        Commence à rédiger ton devoir ici...
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 whitespace-pre-wrap break-words px-5 py-8 font-serif text-lg leading-8 text-slate-900 sm:px-10 sm:text-xl sm:leading-9 md:px-16 md:py-12"
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
 * Fusionne texte brut et erreurs triées en segments non chevauchants pour préserver la fluidité.
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

/** Calcule localement le nombre de mots pour garder l'editeur autonome. */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
