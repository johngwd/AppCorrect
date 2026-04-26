import type { LucideIcon } from 'lucide-react';

type TextFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/**
 * Champ texte partage par le formulaire: l'icone donne un repere visuel rapide, surtout sur mobile.
 */
export function TextField({ icon: Icon, label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="group grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition group-focus-within:border-slate-400 group-focus-within:ring-4 group-focus-within:ring-slate-100">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-slate-700" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

type SelectFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

/**
 * Select harmonise avec les inputs afin de garder une interface calme et previsible.
 */
export function SelectField({ icon: Icon, label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="group grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition group-focus-within:border-slate-400 group-focus-within:ring-4 group-focus-within:ring-slate-100">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-slate-700" />
        <select
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-950 outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
