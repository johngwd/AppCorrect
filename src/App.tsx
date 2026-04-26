import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Editor } from './components/Editor';
import { FloatingFooter } from './components/Footer';
import { Header } from './components/Header';
import { CorrectionTooltip } from './components/Tooltip';
import { INITIAL_METADATA, STORAGE_KEY } from './constants';
import { checkText } from './lib/CorrectionEngine';
import { exportAssignmentPdf } from './lib/pdfExport';
import type { StudentMetadata } from './types';

type DraftState = {
  metadata: StudentMetadata;
  text: string;
};

/**
 * App est le chef d'orchestre: il conserve l'etat, declenche la persistance locale
 * et distribue aux composants uniquement les donnees dont ils ont besoin.
 */
export default function App() {
  const [initialDraft] = useState(loadDraft);
  const [metadata, setMetadata] = useState<StudentMetadata>(initialDraft.metadata);
  const [text, setText] = useState(initialDraft.text);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  /**
   * Sauvegarde en temps reel les champs et le texte. L'ecriture localStorage est
   * peu couteuse ici et evite toute perte en cas de fermeture de l'onglet.
   */
  useEffect(() => {
    const draft: DraftState = { metadata, text };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [metadata, text]);

  /**
   * Transforme le scroll en etat UI: l'en-tete garde l'identite visible mais
   * reduit les champs pour liberer davantage de place a la feuille.
   */
  useEffect(() => {
    const updateHeaderState = () => setIsHeaderCollapsed(window.scrollY > 80);
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    return () => window.removeEventListener('scroll', updateHeaderState);
  }, []);

  const issues = useMemo(
    () => checkText(text, metadata.classLevel, metadata.language),
    [metadata.classLevel, metadata.language, text],
  );

  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) {
      return null;
    }

    return issues.find((issue) => issue.id === selectedIssueId) ?? null;
  }, [issues, selectedIssueId]);

  const wordCount = useMemo(() => countWords(text), [text]);

  /**
   * Met a jour une metadonnee sans reconstruire manuellement tout le formulaire.
   */
  const updateMetadata = (field: keyof StudentMetadata, value: string) => {
    setMetadata((currentMetadata) => ({
      ...currentMetadata,
      [field]: value,
    }));
  };

  /**
   * Nettoie le brouillon local et remet l'application dans son etat initial.
   */
  const resetDraft = () => {
    setMetadata(INITIAL_METADATA);
    setText('');
    setSelectedIssueId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Lance l'export academique A4 avec l'identite et le texte actuel.
   */
  const exportPdf = () => exportAssignmentPdf(metadata, text);

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.7),transparent_28rem),radial-gradient(circle_at_top_right,rgba(226,232,240,0.95),transparent_24rem)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-4 sm:px-6 md:pb-12 lg:px-8">
        <Header
          metadata={metadata}
          isCompact={isHeaderCollapsed}
          isOpen={isMobileConfigOpen}
          onToggle={() => setIsMobileConfigOpen((isOpen) => !isOpen)}
          onChange={updateMetadata}
        />

        <motion.section
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
          layout
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Editor
            text={text}
            issues={issues}
            selectedIssueId={selectedIssueId}
            onTextChange={setText}
            onSelectIssue={setSelectedIssueId}
          />

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Conseils
              </p>
              <h2 className="mt-2 text-xl font-black">Autocorrection</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Clique sur un passage rouge. L'indice explique la regle sans donner la reponse pour t'aider a progresser.
              </p>
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 ring-1 ring-amber-100">
                Niveau actuel: {metadata.classLevel}. Les indices deviennent plus precis lorsque la classe augmente.
              </div>
            </div>
          </aside>
        </motion.section>
      </div>

      <AnimatePresence>
        {selectedIssue && (
          <CorrectionTooltip
            key={selectedIssue.id}
            issue={selectedIssue}
            onClose={() => setSelectedIssueId(null)}
          />
        )}
      </AnimatePresence>

      <FloatingFooter
        issueCount={issues.length}
        wordCount={wordCount}
        onExport={exportPdf}
        onReset={resetDraft}
      />
    </main>
  );
}

/**
 * Charge le brouillon sauvegarde en protegant l'application contre un JSON invalide.
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
 * Compte les mots avec une operation lineaire simple pour rester fluide jusqu'a
 * de longs devoirs d'environ 1000 mots.
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
