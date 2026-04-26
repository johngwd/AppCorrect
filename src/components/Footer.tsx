import { Save } from 'lucide-react';

type FooterProps = {
  wordCount: number;
};

/**
 * Fournit un etat discret et flottant comme dans la maquette HTML de reference.
 */
export function FloatingFooter({ wordCount }: FooterProps) {
  return (
    <footer className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-6 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-xs font-medium text-slate-500 shadow-sm backdrop-blur">
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="flex h-2 w-2 rounded-full bg-green-500" />
        <Save aria-hidden="true" className="h-3.5 w-3.5" />
        Auto-sauvegarde active
      </span>
      <span className="whitespace-nowrap">{wordCount} mots</span>
    </footer>
  );
}
