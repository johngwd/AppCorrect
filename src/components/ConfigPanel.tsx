import { CLASS_LEVELS, LANGUAGES } from '../constants';
import type { StudentMetadata } from '../types';

type ConfigPanelProps = {
  metadata: StudentMetadata;
  onChange: (field: keyof StudentMetadata, value: string) => void;
};

/**
 * Reproduit la carte de configuration attendue: trois groupes lisibles,
 * des champs sobres sur fond gris clair et une grille mobile-first.
 */
export function ConfigPanel({ metadata, onChange }: ConfigPanelProps) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FieldGroup title="Eleve">
          <div className="flex gap-2">
            <PlainInput
              value={metadata.firstName}
              placeholder="Prenom"
              onChange={(value) => onChange('firstName', value)}
            />
            <PlainInput
              value={metadata.lastName}
              placeholder="Nom"
              onChange={(value) => onChange('lastName', value)}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Classe & Matiere">
          <div className="flex gap-2">
            <PlainSelect
              value={metadata.classLevel}
              options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
              onChange={(value) => onChange('classLevel', value)}
            />
            <PlainInput
              value={metadata.subject}
              placeholder="Matiere"
              onChange={(value) => onChange('subject', value)}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Configuration">
          <div className="flex gap-2">
            <PlainSelect
              value={metadata.language}
              options={LANGUAGES}
              onChange={(value) => onChange('language', value as StudentMetadata['language'])}
            />
            <PlainInput
              value={metadata.teacherName}
              placeholder="Nom du Professeur"
              onChange={(value) => onChange('teacherName', value)}
            />
          </div>
        </FieldGroup>
      </div>
    </section>
  );
}

type FieldGroupProps = {
  title: string;
  children: React.ReactNode;
};

/** Encapsule un groupe de champs avec un libelle academique discret. */
function FieldGroup({ title, children }: FieldGroupProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase text-slate-400">
        {title}
      </label>
      {children}
    </div>
  );
}

type PlainInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/** Champ texte minimaliste, proche du rendu HTML fourni. */
function PlainInput({ value, placeholder, onChange }: PlainInputProps) {
  return (
    <input
      className="w-full rounded-lg border-none bg-slate-50 p-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type PlainSelectProps = {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

/** Select compact partageant le meme style que les inputs. */
function PlainSelect({ value, options, onChange }: PlainSelectProps) {
  return (
    <select
      className="w-full rounded-lg border-none bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
