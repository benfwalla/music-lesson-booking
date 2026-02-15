'use client';

import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface MultiSelectProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  label?: string;
}

export function MultiSelect<T extends string>({ options, selected, onChange }: MultiSelectProps<T>) {
  const toggle = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {option}
            {isSelected && <X className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}

interface CheckboxGroupProps<T extends number> {
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  formatLabel?: (value: T) => string;
}

export function CheckboxGroup<T extends number>({ options, selected, onChange, formatLabel }: CheckboxGroupProps<T>) {
  const toggle = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggle(option)}
              className="rounded border-border"
            />
            <span className={`text-sm ${isSelected ? 'font-medium' : 'text-muted-foreground'}`}>
              {formatLabel ? formatLabel(option) : `${option}`}
            </span>
          </label>
        );
      })}
    </div>
  );
}
