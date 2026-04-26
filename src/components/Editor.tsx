import type { CorrectionIssue } from '../types';

type TooltipPosition = {
  top: number;
  left: number;
};

type EditorProps = {
  text: string;
  issues: CorrectionIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string, position: TooltipPosition) => void;
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
  return (
    <section className="relative flex justify-center">
      <div className="paper-a4 relative mb-20 min-h-[29.7cm] w-[21cm] max-w-[95vw] bg-white p-8 text-xl leading-relaxed text-slate-800 shadow-xl transition-all duration-300 md:p-20">
        <textarea
          className="relative z-10 min-h-[24cm] w-full resize-none bg-transparent font-serif text-xl leading-relaxed text-transparent caret-slate-900 outline-none selection:bg-indigo-100"
          aria-label="Zone de rédaction"
          spellCheck="false"
          value={text}
          placeholder="Commencez à rédiger votre devoir ici..."
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

type HighlightedTextProps = {
  text: string;
  issues: CorrectionIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string, position: TooltipPosition) => void;
};

/**
 * Transforme les erreurs en segments cliquables sans recalcul coûteux à chaque rendu de mot.
 */
function HighlightedText({ text, issues, selectedIssueId, onSelectIssue }: HighlightedTextProps) {
  const segments = buildHighlightedSegments(text, issues);

  if (!text) {
    return (
      <div className="pointer-events-none absolute inset-0 p-8 font-serif text-xl leading-relaxed text-slate-400 md:p-20">
        Commencez à rédiger votre devoir ici...
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 whitespace-pre-wrap break-words p-8 font-serif text-xl leading-relaxed text-slate-800 md:p-20"
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
            className={`pointer-events-auto rounded px-0.5 text-left text-slate-800 decoration-[#fca5a5] decoration-2 underline-offset-4 transition hover:bg-red-100 ${
              isSelected ? 'bg-red-100 underline decoration-wavy' : 'underline decoration-wavy'
            }`}
            type="button"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onSelectIssue(issue.id, {
                top: rect.top + window.scrollY - 112,
                left: rect.left + rect.width / 2 - 120,
              });
            }}
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

