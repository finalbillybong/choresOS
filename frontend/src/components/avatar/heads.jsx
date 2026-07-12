/* ── Head shapes ──
   Each head now includes small ears for a more complete look. */

function HeadFinish({ left = 9.5, right = 22.5, earY = 14, faceY = 14 }) {
  return (
    <>
      <ellipse className="avatar-detail" cx={left} cy={earY} rx="0.42" ry="0.68" fill="#7c2d12" opacity="0.16" />
      <ellipse className="avatar-detail" cx={right} cy={earY} rx="0.42" ry="0.68" fill="#7c2d12" opacity="0.16" />
      <ellipse className="avatar-highlight" cx="13.2" cy={faceY - 4.7} rx="2.6" ry="1.2" fill="white" opacity="0.1" />
      <path className="avatar-detail" d={`M15.7,${faceY - 0.8} Q16.4,${faceY + 0.3} 15.7,${faceY + 0.7}`} stroke="#7c2d12" strokeWidth="0.26" fill="none" opacity="0.22" strokeLinecap="round" />
      <ellipse className="avatar-detail" cx="16" cy={faceY + 6.2} rx="4.6" ry="0.7" fill="#7c2d12" opacity="0.08" />
    </>
  );
}

function HeadRound({ color }) {
  return (
    <>
      <ellipse cx="9.5" cy="14" rx="1.2" ry="1.5" fill={color} opacity="0.85" />
      <ellipse cx="22.5" cy="14" rx="1.2" ry="1.5" fill={color} opacity="0.85" />
      <ellipse cx="16" cy="14" rx="7" ry="8" fill={color} />
      <HeadFinish />
    </>
  );
}

function HeadOval({ color }) {
  return (
    <>
      <ellipse cx="10.5" cy="14" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="21.5" cy="14" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="16" cy="14" rx="6" ry="9" fill={color} />
      <HeadFinish left={10.5} right={21.5} />
    </>
  );
}

function HeadSquare({ color }) {
  return (
    <>
      <ellipse cx="9.5" cy="14" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="22.5" cy="14" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <rect x="9" y="6" width="14" height="16" rx="3" fill={color} />
      <HeadFinish />
    </>
  );
}

function HeadDiamond({ color }) {
  return (
    <>
      <ellipse cx="9.5" cy="14" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <ellipse cx="22.5" cy="14" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <polygon points="16,5 23,14 16,23 9,14" fill={color} />
      <HeadFinish />
    </>
  );
}

function HeadHeart({ color }) {
  return (
    <>
      <ellipse cx="8.5" cy="12" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <ellipse cx="23.5" cy="12" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <path
        d="M16,22 C16,22 8,16 8,11 C8,8 10,6 13,6 C14.5,6 15.5,7 16,8 C16.5,7 17.5,6 19,6 C22,6 24,8 24,11 C24,16 16,22 16,22Z"
        fill={color}
      />
      <HeadFinish left={8.5} right={23.5} earY={12} faceY={13.5} />
    </>
  );
}

function HeadLong({ color }) {
  return (
    <>
      <ellipse cx="10.5" cy="13" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="21.5" cy="13" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="16" cy="13" rx="6" ry="10" fill={color} />
      <HeadFinish left={10.5} right={21.5} earY={13} faceY={13} />
    </>
  );
}

function HeadTriangle({ color }) {
  return (
    <>
      <ellipse cx="9" cy="18" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <ellipse cx="23" cy="18" rx="1" ry="1.2" fill={color} opacity="0.85" />
      <path d="M16,5 L24,22 L8,22 Z" fill={color} />
      <HeadFinish left={9} right={23} earY={18} faceY={15.5} />
    </>
  );
}

function HeadPear({ color }) {
  return (
    <>
      <ellipse cx="9.5" cy="16" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="22.5" cy="16" rx="1" ry="1.3" fill={color} opacity="0.85" />
      <path
        d="M13,6 Q10,6 9,10 Q8,16 10,20 Q12,23 16,23 Q20,23 22,20 Q24,16 23,10 Q22,6 19,6 Q16,5 13,6Z"
        fill={color}
      />
      <HeadFinish earY={16} faceY={14.8} />
    </>
  );
}

function HeadWide({ color }) {
  return (
    <>
      <ellipse cx="7.5" cy="14" rx="1.2" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="24.5" cy="14" rx="1.2" ry="1.3" fill={color} opacity="0.85" />
      <ellipse cx="16" cy="14" rx="9" ry="7" fill={color} />
      <HeadFinish left={7.5} right={24.5} />
    </>
  );
}

export const HEAD_MAP = {
  round: HeadRound,
  oval: HeadOval,
  square: HeadSquare,
  diamond: HeadDiamond,
  heart: HeadHeart,
  long: HeadLong,
  triangle: HeadTriangle,
  pear: HeadPear,
  wide: HeadWide,
};
