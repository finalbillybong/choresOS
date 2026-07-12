/* ── Body shapes + outfit patterns ── */

export function renderBody(shape, color) {
  switch (shape) {
    case 'slim':
      return (
        <>
          <path d="M12,22 Q11,22 11,24 L11,32 L21,32 L21,24 Q21,22 20,22 Z" fill={color} />
          <path className="avatar-highlight" d="M13,22 Q16,23 19,22" stroke="white" strokeWidth="0.38" fill="none" opacity="0.2" />
          <path className="avatar-detail" d="M12.2,25 Q16,23.8 19.8,25" stroke="#020617" strokeWidth="0.24" fill="none" opacity="0.16" />
        </>
      );
    case 'broad':
      return (
        <>
          <path d="M9,22 Q7,22 7,24 L7,32 L25,32 L25,24 Q25,22 23,22 Z" fill={color} />
          <path d="M11,22 Q16,24 21,22" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1" />
        </>
      );
    case 'regular':
    default:
      return (
        <>
          <path d="M11,22 Q9,22 9,24 L9,32 L23,32 L23,24 Q23,22 21,22 Z" fill={color} />
          <path d="M12,22 Q16,23.5 20,22" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1" />
        </>
      );
  }
}

export function renderOutfitPattern(style, bodyShape) {
  const bounds = bodyShape === 'slim'
    ? { x: 11, w: 10 }
    : bodyShape === 'broad'
    ? { x: 7, w: 18 }
    : { x: 9, w: 14 };

  switch (style) {
    case 'stripes':
      return (
        <g opacity="0.3">
          {[24, 26, 28].map((y) => (
            <line key={y} x1={bounds.x + 1} y1={y} x2={bounds.x + bounds.w - 1} y2={y}
              stroke="white" strokeWidth="0.8" />
          ))}
        </g>
      );
    case 'stars':
      return (
        <g opacity="0.3">
          <text x="13" y="27" fill="white" fontSize="3" fontFamily="sans-serif">&#9733;</text>
          <text x="17" y="29" fill="white" fontSize="3" fontFamily="sans-serif">&#9733;</text>
        </g>
      );
    case 'camo': {
      const cx = bounds.x + bounds.w / 2;
      return (
        <g opacity="0.2">
          <circle cx={cx - 2} cy="25" r="1.5" fill="#2d4a2d" />
          <circle cx={cx + 2} cy="27" r="2" fill="#3d5a3d" />
          <circle cx={cx - 1} cy="29" r="1.2" fill="#2d4a2d" />
        </g>
      );
    }
    case 'tie_dye': {
      const cx = bounds.x + bounds.w / 2;
      return (
        <g opacity="0.25">
          <circle cx={cx} cy="26" r="3" fill="#ff6b9d" />
          <circle cx={cx - 2} cy="28" r="2" fill="#64dfdf" />
          <circle cx={cx + 2} cy="25" r="1.5" fill="#f9d71c" />
        </g>
      );
    }
    case 'plaid':
      return (
        <g opacity="0.2">
          {[24, 27, 30].map((y) => (
            <line key={`h${y}`} x1={bounds.x + 1} y1={y} x2={bounds.x + bounds.w - 1} y2={y}
              stroke="white" strokeWidth="0.4" />
          ))}
          {[bounds.x + 3, bounds.x + bounds.w / 2, bounds.x + bounds.w - 3].map((x) => (
            <line key={`v${x}`} x1={x} y1="23" x2={x} y2="31"
              stroke="white" strokeWidth="0.4" />
          ))}
        </g>
      );
    case 'neon_pulse': {
      const cx = bounds.x + bounds.w / 2;
      return (
        <g opacity="0.5">
          <path d={`M${bounds.x + 1},27 H${cx - 2} L${cx - 1},25 L${cx + 1},29 L${cx + 2},27 H${bounds.x + bounds.w - 1}`} stroke="#64dfdf" strokeWidth="0.55" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={cx} cy="24.7" r="0.8" fill="#ff6b9d" opacity="0.8" />
          <circle cx={cx + 3} cy="29.2" r="0.55" fill="#f9d71c" opacity="0.75" />
        </g>
      );
    }
    case 'moon_sigil': {
      const cx = bounds.x + bounds.w / 2;
      return (
        <g opacity="0.42">
          <circle cx={cx} cy="26.7" r="2.5" fill="none" stroke="white" strokeWidth="0.45" />
          <path d={`M${cx + 1.2},24.6 Q${cx - 0.6},26.7 ${cx + 1.2},28.8 Q${cx - 2.3},27 ${cx + 1.2},24.6 Z`} fill="white" opacity="0.55" />
          <text x={cx} y="30.4" textAnchor="middle" fill="#a78bfa" fontSize="2.5" fontFamily="sans-serif">&#10022;</text>
        </g>
      );
    }
    case 'tiny_bows': {
      const xs = [bounds.x + bounds.w * 0.35, bounds.x + bounds.w * 0.65];
      return (
        <g opacity="0.38">
          {xs.map((x, i) => (
            <g key={i} transform={`translate(${x},${25 + i * 3})`}>
              <path d="M-2,-0.8 Q-0.8,-1.8 0,0 Q-0.8,1 -2,0.8 Z" fill="#f472b6" />
              <path d="M2,-0.8 Q0.8,-1.8 0,0 Q0.8,1 2,0.8 Z" fill="#f472b6" />
              <circle cx="0" cy="0" r="0.35" fill="white" opacity="0.7" />
            </g>
          ))}
        </g>
      );
    }
    case 'bat_stars': {
      const cx = bounds.x + bounds.w / 2;
      return (
        <g opacity="0.42">
          <path d={`M${cx - 4},27 Q${cx - 2},24.8 ${cx},27 Q${cx + 2},24.8 ${cx + 4},27 Q${cx + 2},26.6 ${cx},29 Q${cx - 2},26.6 ${cx - 4},27 Z`} fill="#111827" />
          <text x={cx - 3} y="24.8" fill="#f472b6" fontSize="2.2" fontFamily="sans-serif">&#9733;</text>
          <text x={cx + 2.4} y="30.5" fill="#a78bfa" fontSize="2.2" fontFamily="sans-serif">&#9733;</text>
        </g>
      );
    }
    case 'none':
    default:
      return null;
  }
}
