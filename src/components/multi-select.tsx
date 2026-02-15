'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface MultiSelectProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  label?: string;
  customValues?: string[];
  onCustomValuesChange?: (values: string[]) => void;
}

export function MultiSelect<T extends string>({ options, selected, onChange, customValues = [], onCustomValuesChange }: MultiSelectProps<T>) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
      // If deselecting "Other", clear custom values
      if (option === ('Other' as T) && onCustomValuesChange) {
        onCustomValuesChange([]);
      }
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustomInstrument = () => {
    const val = customInput.trim();
    if (val && onCustomValuesChange && !customValues.includes(val)) {
      onCustomValuesChange([...customValues, val]);
      setCustomInput('');
    }
  };

  const removeCustomInstrument = (val: string) => {
    if (onCustomValuesChange) {
      onCustomValuesChange(customValues.filter(v => v !== val));
    }
  };

  const showOtherInput = selected.includes('Other' as T) && onCustomValuesChange;

  return (
    <div className="space-y-3">
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
      {showOtherInput && (
        <div className="space-y-2">
          <div className="flex gap-2 max-w-sm">
            <Input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Type custom instrument..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomInstrument(); } }}
            />
            <button
              type="button"
              onClick={addCustomInstrument}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add
            </button>
          </div>
          {customValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customValues.map(val => (
                <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                  {val}
                  <button type="button" onClick={() => removeCustomInstrument(val)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
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
