import { Download, PenTool, RotateCcw } from 'lucide-react';

type HeaderProps = {
  onExport: () => void;
  onReset: () => void;
};

/**
 * Affiche la barre de marque et les actions principales, dans l'esprit sobre du rendu fourni.
 */
export function Header({ onExport, onReset }: HeaderProps) {
  return (
    <header className="mx-auto mb-8 flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-sm shadow-indigo-600/20">
          <PenTool aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800">Correcteur Académique</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-red-600"
          type="button"
          onClick={onReset}
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Nouveau
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
          type="button"
          onClick={onExport}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Exporter en PDF A4
        </button>
      </div>
    </header>
  );
}
