import { Check, Lock } from 'lucide-react';

import AvatarDisplay from '../AvatarDisplay';


export default function AvatarOptionCard({
  option,
  previewConfig,
  selected = false,
  locked = false,
  onSelect,
  onPreview,
  onPreviewEnd,
}) {
  const startPreview = () => {
    if (locked) onPreview?.();
  };
  const endPreview = () => {
    if (locked) onPreviewEnd?.();
  };

  return (
    <button
      type="button"
      aria-label={`${option.label}${locked ? ' — locked' : ''}`}
      aria-pressed={selected}
      aria-disabled={locked}
      onClick={() => {
        if (!locked) onSelect?.();
      }}
      onMouseEnter={startPreview}
      onMouseLeave={endPreview}
      onFocus={startPreview}
      onBlur={endPreview}
      onTouchStart={startPreview}
      onTouchEnd={endPreview}
      onTouchCancel={endPreview}
      className={`avatar-option-card group relative flex min-h-[112px] flex-col items-center justify-between overflow-hidden rounded-xl border p-2.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        selected
          ? 'border-accent bg-accent/12 shadow-lg shadow-accent/10'
          : locked
            ? 'border-border/70 bg-navy/35 text-muted'
            : 'border-border bg-surface-raised/35 hover:-translate-y-0.5 hover:border-border-light hover:bg-surface-raised/70'
      }`}
    >
      <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-navy/45 shadow-inner">
        <AvatarDisplay config={previewConfig} size="md" />
        {locked ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/58 backdrop-blur-[1px]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/35 bg-amber-400/12 text-amber-300 shadow-lg">
              <Lock size={13} aria-hidden="true" />
            </span>
          </span>
        ) : null}
        {selected ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-navy shadow-md">
            <Check size={12} strokeWidth={3} aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${
        selected ? 'text-accent' : locked ? 'text-muted/70' : 'text-cream/85'
      }`}>
        {option.label}
      </span>
    </button>
  );
}
