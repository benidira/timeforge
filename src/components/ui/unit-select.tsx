import type { UnitChoice } from "@/lib/time";

const LABELS: Record<UnitChoice, string> = {
  auto: "Auto-detect",
  seconds: "Seconds",
  milliseconds: "Milliseconds",
};

interface UnitSelectProps {
  id: string;
  value: UnitChoice;
  onChange: (value: UnitChoice) => void;
  choices: UnitChoice[];
  label?: string;
}

export function UnitSelect({ id, value, onChange, choices, label = "Unit" }: UnitSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value as UnitChoice)}>
        {choices.map((c) => (
          <option key={c} value={c}>
            {LABELS[c]}
          </option>
        ))}
      </select>
    </div>
  );
}
