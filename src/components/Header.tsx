import { motion } from 'framer-motion';
import {
  BookMarked,
  BookOpenCheck,
  ChevronDown,
  GraduationCap,
  Languages,
  School,
  User,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { LANGUAGES, CLASS_LEVELS } from '../constants';
import { SelectField, TextField } from './Fields';
import type { StudentMetadata } from '../types';

type HeaderProps = {
  isCompact: boolean;
  isOpen: boolean;
  metadata: StudentMetadata;
  onToggle: () => void;
  onChange: (field: keyof StudentMetadata, value: string) => void;
};

/**
 * En-tete intelligent: il affiche l'identite du devoir et se compacte au scroll pour liberer la feuille.
 */
export function Header({ isCompact, isOpen, metadata, onToggle, onChange }: HeaderProps) {
  return (
    <motion.header
      className="sticky top-3 z-40 rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-apple backdrop-blur-xl"
      animate={{ y: isCompact ? -4 : 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left md:hidden"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <BrandBlock isCompact={isCompact} />
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="hidden px-5 py-4 md:block">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BrandBlock isCompact={isCompact} />
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            Brouillon sauvegarde automatiquement
          </p>
        </div>
        <motion.div
          className="grid gap-3 lg:grid-cols-6"
          animate={{ height: isCompact ? 0 : 'auto', opacity: isCompact ? 0 : 1 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          <HeaderFields metadata={metadata} onChange={onChange} />
        </motion.div>
      </div>

      <motion.div
        className="md:hidden"
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div className="grid gap-3 border-t border-slate-100 px-4 pb-4 pt-3 sm:grid-cols-2">
          <HeaderFields metadata={metadata} onChange={onChange} />
        </div>
      </motion.div>
    </motion.header>
  );
}

type HeaderFieldsProps = {
  metadata: StudentMetadata;
  onChange: (field: keyof StudentMetadata, value: string) => void;
};

/**
 * Regroupe les champs academiques pour eviter une duplication entre desktop et mobile.
 */
function HeaderFields({ metadata, onChange }: HeaderFieldsProps) {
  return (
    <>
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
        label="Professeur"
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
    </>
  );
}

type BrandBlockProps = {
  isCompact: boolean;
};

/**
 * Identite visuelle du produit, inspiree d'un melange Notion et Apple.
 */
function BrandBlock({ isCompact }: BrandBlockProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-lg shadow-slate-950/15">
        <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Correcteur Academique
        </p>
        <motion.h1
          className="truncate font-black tracking-tight text-slate-950"
          animate={{ fontSize: isCompact ? 18 : 24 }}
          transition={{ duration: 0.2 }}
        >
          Rediger avec des indices pedagogiques
        </motion.h1>
      </div>
      <GraduationCap aria-hidden="true" className="hidden h-5 w-5 text-slate-300 lg:block" />
    </div>
  );
}
