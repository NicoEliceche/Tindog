// src/shared/components/ui/Toggle.tsx
import React from 'react';
import { ToggleWrapper, ToggleLabel, ToggleTrack, ToggleThumb } from './ToggleStyled';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, ariaLabel, disabled, className }: ToggleProps) {
  return (
    <ToggleWrapper className={className}>
      <ToggleTrack
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        $checked={checked}
        onClick={() => onChange(!checked)}
      >
        <ToggleThumb $checked={checked} />
      </ToggleTrack>
      {label && <ToggleLabel>{label}</ToggleLabel>}
    </ToggleWrapper>
  );
}
