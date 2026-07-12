/* ── Face extras ──
   Blush now uses a softer, more natural tint. */

export function renderFaceExtra(style) {
  switch (style) {
    case 'freckles':
      return (
        <g opacity="0.4">
          {[[11, 16], [13, 16.5], [12, 17.5], [19, 16], [21, 16.5], [20, 17.5]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.4" fill="#8b4513" />
          ))}
        </g>
      );
    case 'blush':
      return (
        <>
          <ellipse className="avatar-detail" cx="11" cy="16.5" rx="2" ry="1" fill="#e8878a" opacity="0.24" />
          <ellipse className="avatar-highlight" cx="10.5" cy="16.15" rx="0.65" ry="0.25" fill="white" opacity="0.2" />
          <ellipse className="avatar-detail" cx="21" cy="16.5" rx="2" ry="1" fill="#e8878a" opacity="0.24" />
          <ellipse className="avatar-highlight" cx="20.5" cy="16.15" rx="0.65" ry="0.25" fill="white" opacity="0.2" />
        </>
      );
    case 'face_paint':
      return (
        <g opacity="0.5">
          <line x1="10" y1="14" x2="13" y2="15" stroke="#e74c3c" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="10" y1="15" x2="13" y2="16" stroke="#3b82f6" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="19" y1="15" x2="22" y2="14" stroke="#e74c3c" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="19" y1="16" x2="22" y2="15" stroke="#3b82f6" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      );
    case 'scar':
      return (
        <g opacity="0.5">
          <line x1="19" y1="11" x2="21" y2="16" stroke="#cc6666" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="19.5" y1="13" x2="21" y2="13" stroke="#cc6666" strokeWidth="0.4" strokeLinecap="round" />
          <line x1="20" y1="14.5" x2="21.3" y2="14.2" stroke="#cc6666" strokeWidth="0.4" strokeLinecap="round" />
        </g>
      );
    case 'bandage':
      return (
        <>
          <rect x="18" y="11" width="4" height="3" rx="0.5" fill="#f5d6b8" />
          <line x1="19" y1="12" x2="21" y2="12" stroke="#cc6666" strokeWidth="0.3" />
          <line x1="19" y1="13" x2="21" y2="13" stroke="#cc6666" strokeWidth="0.3" />
        </>
      );
    case 'stickers':
      return (
        <g opacity="0.7">
          <text x="21" y="12" fill="#f9d71c" fontSize="3" fontFamily="sans-serif">&#9733;</text>
          <circle cx="10.5" cy="16" r="1" fill="#ff6b9d" opacity="0.6" />
        </g>
      );
    case 'rune_marks':
      return (
        <g opacity="0.72">
          <path d="M10.2,12.2 L12.2,11.4 L11.4,13.7 Z" stroke="#a78bfa" strokeWidth="0.35" fill="none" strokeLinejoin="round" />
          <line x1="21" y1="11.5" x2="19.5" y2="14.2" stroke="#64dfdf" strokeWidth="0.45" strokeLinecap="round" />
          <line x1="19.4" y1="12.1" x2="21.1" y2="13.4" stroke="#64dfdf" strokeWidth="0.35" strokeLinecap="round" />
        </g>
      );
    case 'whiskers':
      return (
        <g opacity="0.55">
          <line x1="8.5" y1="15.8" x2="13" y2="15.2" stroke="#333333" strokeWidth="0.35" strokeLinecap="round" />
          <line x1="8.8" y1="17" x2="13" y2="16.5" stroke="#333333" strokeWidth="0.35" strokeLinecap="round" />
          <line x1="23.5" y1="15.8" x2="19" y2="15.2" stroke="#333333" strokeWidth="0.35" strokeLinecap="round" />
          <line x1="23.2" y1="17" x2="19" y2="16.5" stroke="#333333" strokeWidth="0.35" strokeLinecap="round" />
        </g>
      );
    case 'mischief_mark':
      return (
        <g opacity="0.75">
          <path d="M20.5,11.2 Q22,12 20.8,13.1 Q22.1,13.4 21.3,14.8" stroke="#f472b6" strokeWidth="0.55" fill="none" strokeLinecap="round" />
          <circle cx="10.7" cy="12.6" r="0.6" fill="#a855f7" opacity="0.65" />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}
