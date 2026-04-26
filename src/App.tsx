import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ConfigPanel } from './components/ConfigPanel';
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
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  /**
   * Sauvegarde en temps reel les champs et le texte. L'ecriture localStorage est
   * peu couteuse ici et evite toute perte en cas de fermeture de l'onglet.
   */
  useEffect(() => {
    const draft: DraftState = { metadata, text };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [metadata, text]);

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
    <main className="min-h-screen bg-[#F8FAFC] px-2 py-2 font-sans text-slate-950 md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <Header onReset={resetDraft} onExport={exportPdf} />

        <ConfigPanel metadata={metadata} onChange={updateMetadata} />

        <Editor
          text={text}
          issues={issues}
          selectedIssueId={selectedIssueId}
          onTextChange={setText}
          onSelectIssue={(issueId, position) => {
            setSelectedIssueId(issueId);
            setTooltipPosition(position);
          }}
        />
      </div>

      <AnimatePresence>
        {selectedIssue && (
          <CorrectionTooltip
            key={selectedIssue.id}
            issue={selectedIssue}
            position={tooltipPosition}
            onClose={() => setSelectedIssueId(null)}
          />
        )}
      </AnimatePresence>

      <FloatingFooter wordCount={wordCount} />
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
