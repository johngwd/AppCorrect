import { motion } from 'framer-motion';
import type { CorrectionIssue } from '../types';

type TooltipProps = {
  issue: CorrectionIssue | null;
  position: { top: number; left: number } | null;
  onClose: () => void;
};

/**
 * Affiche une bulle jaune claire au plus pres du mot clique, comme dans le prototype fourni.
 */
export function CorrectionTooltip({ issue, position, onClose }: TooltipProps) {
  if (!issue || !position) {
    return null;
  }

  return (
    <motion.aside
      className="fixed z-50 w-[min(20rem,calc(100vw-2rem))]"
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className="relative rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-xl drop-shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">
            💡
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-amber-800">
              Indice Pédagogique
            </p>
            <p className="text-sm leading-snug text-amber-900">{issue.message}</p>
          </div>
        </div>
        <div className="mt-3 text-right">
          <button
            className="text-xs font-semibold text-amber-700 hover:underline"
            type="button"
            onClick={onClose}
          >
            J'ai compris
          </button>
        </div>
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-amber-200 bg-amber-50" />
      </div>
    </motion.aside>
  );
}
