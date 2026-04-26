import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import type { CorrectionIssue } from '../types';

type TooltipProps = {
  issue: CorrectionIssue | null;
  onClose: () => void;
};

/**
 * Affiche la bulle pedagogique jaune clair avec une transition douce.
 * Le contenu reste volontairement indiciel: il rappelle une regle sans livrer la correction.
 */
export function CorrectionTooltip({ issue, onClose }: TooltipProps) {
  return (
    <AnimatePresence>
      {issue && (
        <motion.aside
          className="absolute bottom-5 left-4 right-4 z-30 rounded-[1.75rem] border border-amber-200 bg-amber-50/95 p-4 shadow-2xl shadow-amber-900/10 backdrop-blur sm:left-auto sm:max-w-md"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="rounded-2xl bg-white/80 p-2 text-amber-700 ring-1 ring-amber-200">
                <Lightbulb aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Indice {issue.category}
                </p>
                <h3 className="mt-1 font-black text-slate-950">{issue.title}</h3>
              </div>
            </div>
            <button
              className="rounded-full p-2 text-amber-700 transition hover:bg-white hover:text-slate-900"
              type="button"
              aria-label="Fermer l'indice"
              onClick={onClose}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm leading-6 text-slate-800">{issue.message}</p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
