import { Download, Eraser, Save, Sparkles } from 'lucide-react';

type FooterProps = {
  issueCount: number;
  wordCount: number;
  onExport: () => void;
  onReset: () => void;
};

/**
 * Fournit les actions principales dans une barre fixe sur mobile et une zone discrete sur desktop.
 */
export function FloatingFooter({ issueCount, wordCount, onExport, onReset }: FooterProps) {
  return (
    <>
      <footer className="hidden items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm lg:flex">
        <span className="inline-flex items-center gap-2">
          <Save aria-hidden="true" className="h-4 w-4 text-emerald-600" />
          Sauvegarde locale en temps reel
        </span>
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-500" />
          {wordCount} mot{wordCount > 1 ? 's' : ''} · {issueCount} indice{issueCount > 1 ? 's' : ''}
        </span>
      </footer>

      <div className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-[1.5rem] border border-white/80 bg-white/90 p-2 shadow-2xl shadow-slate-950/15 backdrop-blur-xl lg:hidden">
        <button
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-slate-600"
          type="button"
          aria-label="Effacer le brouillon"
          onClick={onReset}
        >
          <Eraser aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20"
          type="button"
          onClick={onExport}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Exporter mon devoir
        </button>
      </div>
    </>
  );
}
