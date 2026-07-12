import { useId, useMemo } from 'react';

import {
  HEAD_MAP,
  EYES_MAP,
  MOUTH_MAP,
  renderHair,
  renderBody,
  renderOutfitPattern,
  renderFaceExtra,
  renderHat,
  renderAccessory,
  renderPet,
  renderPetExtras,
  buildPetColors,
  renderPetAccessory,
} from './avatar';
import { buildAvatarPalette } from './avatar/avatarPaint';

const SIZES = {
  xs: 24,
  sm: 32,
  md: 64,
  lg: 128,
  xl: 176,
};

const AVATAR_COLORS = [
  '#f9d71c', '#2de2a6', '#b388ff', '#64dfdf',
  '#ff4444', '#ff8c42', '#ff6b9d', '#45b7d1',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColor(name) {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

/* ── Eyelid config per eye style ──
   'both' = two eyelids, 'left' = left eye only, null = no blink */
const EYELID_MODE = {
  normal: 'both', wide: 'both', angry: 'both', dot: 'both',
  glasses: 'both', crying: 'both', heart_eyes: 'both',
  wink: 'left',       // right eye already winking
  eye_patch: 'left',  // right eye covered by patch
  // These don't blink:
  happy: null, sleepy: null, closed: null,
  sunglasses: null, star: null, dizzy: null,
};

/* ── Layout offsets per head shape ──
   Shifts hair, hats, and facial features so they align with each head.
   `width`     — horizontal scale for hair & hats (relative to round head rx=7).
   `faceWidth` — gentler horizontal scale for eyes, mouth & face extras. */
const HEAD_OFFSETS = {
  round:    { hair: 0,    hat: 0,    face: 0,   width: 1,    faceWidth: 1 },
  oval:     { hair: -1,   hat: -1,   face: 0,   width: 0.84, faceWidth: 0.92 },
  long:     { hair: -3,   hat: -3,   face: -1,  width: 0.84, faceWidth: 0.92 },
  square:   { hair: 0,    hat: 0,    face: 0,   width: 1,    faceWidth: 1 },
  diamond:  { hair: -1,   hat: -1,   face: 0,   width: 0.92, faceWidth: 0.96 },
  heart:    { hair: 0,    hat: 0,    face: 0,   width: 1.06, faceWidth: 1 },
  triangle: { hair: -1,   hat: -1,   face: 1.5, width: 0.82, faceWidth: 1.04 },
  pear:     { hair: -0.5, hat: -0.5, face: 0.5, width: 0.88, faceWidth: 1.02 },
  wide:     { hair: 1,    hat: 1,    face: 0,   width: 1.22, faceWidth: 1.1 },
};

/* ── Horizontal scale for behind-body accessories per body shape ──
   Keeps capes/wings proportional to the body width. */
const BEHIND_ACCESSORY_SCALE = {
  regular: { cape: 1, wings: 1 },
  slim:    { cape: 1, wings: 0.82 },
  broad:   { cape: 1.3, wings: 1.2 },
};

/* ── Horizontal scale for front-facing accessories per body shape ──
   Scarf wraps the torso so it must match body width. */
const FRONT_ACCESSORY_SCALE = {
  slim:  { scarf: 0.71 },
  broad: { scarf: 1.29 },
};

/* Scale horizontally around center x=16 */
function scaleAroundCenter(s) {
  if (s === 1) return undefined;
  return `translate(16, 0) scale(${s}, 1) translate(-16, 0)`;
}

/* Combine a vertical offset with a horizontal scale around x=16 */
function headTransform(dy, sx) {
  const hasDy = dy && dy !== 0;
  const hasSx = sx && sx !== 1;
  if (!hasDy && !hasSx) return undefined;
  const parts = [];
  if (hasDy) parts.push(`translate(0,${dy})`);
  if (hasSx) parts.push(`translate(16,0) scale(${sx},1) translate(-16,0)`);
  return parts.join(' ');
}

/* ── Main SVG avatar ── */
function SvgAvatar({ config, size }) {
  const rawId = useId();
  const idPrefix = rawId.replace(/:/g, '');
  const palette = useMemo(() => buildAvatarPalette(config), [config]);
  const paintIds = {
    background: `${idPrefix}-background`,
    skin: `${idPrefix}-skin`,
    hair: `${idPrefix}-hair`,
    outfit: `${idPrefix}-outfit`,
    hat: `${idPrefix}-hat`,
    gear: `${idPrefix}-gear`,
    pet: `${idPrefix}-pet`,
    shadow: `${idPrefix}-shadow`,
  };
  const paint = Object.fromEntries(
    Object.entries(paintIds).map(([key, id]) => [key, `url(#${id})`]),
  );

  const headColor = paint.skin;
  const hairColor = paint.hair;
  const eyeColor = config.eye_color || '#333333';
  const mouthColor = config.mouth_color || '#cc6666';
  const bodyColor = paint.outfit;
  const hatColor = paint.hat;
  const accessoryColor = paint.gear;
  const petColors = {
    ...buildPetColors(config),
    body: paint.pet,
  };

  const headShape = config.head || 'round';
  const hairStyle = config.hair || config.hair_style || 'short';
  const eyeStyle = config.eyes || 'normal';
  const mouthStyle = config.mouth || 'smile';
  const bodyShape = config.body || 'regular';
  const hatStyle = config.hat || 'none';
  // Multi-accessory: read accessories array, fall back to legacy single accessory
  const accessories = Array.isArray(config.accessories) && config.accessories.length > 0
    ? config.accessories.filter(a => a !== 'none')
    : (config.accessory && config.accessory !== 'none' ? [config.accessory] : []);
  const faceExtraStyle = config.face_extra || 'none';
  const outfitPatternStyle = config.outfit_pattern || 'none';
  const petStyle = config.pet || 'none';
  const petPosition = config.pet_position || 'right';

  const HeadComponent = HEAD_MAP[headShape] || HEAD_MAP.round;
  const EyesComponent = EYES_MAP[eyeStyle] || EYES_MAP.normal;
  const MouthComponent = MOUTH_MAP[mouthStyle] || MOUTH_MAP.smile;

  const off = HEAD_OFFSETS[headShape] || HEAD_OFFSETS.round;
  const behindScale = BEHIND_ACCESSORY_SCALE[bodyShape] || BEHIND_ACCESSORY_SCALE.regular;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="avatar-svg avatar-illustration rounded-full"
      role="img"
      aria-label="Custom avatar"
    >
      <defs>
        <radialGradient id={paintIds.background} cx="32%" cy="24%" r="82%">
          <stop offset="0%" stopColor={palette.background.light} />
          <stop offset="58%" stopColor={palette.background.base} />
          <stop offset="100%" stopColor={palette.background.deep} />
        </radialGradient>
        <linearGradient id={paintIds.skin} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.skin.light} />
          <stop offset="48%" stopColor={palette.skin.base} />
          <stop offset="100%" stopColor={palette.skin.shadow} />
        </linearGradient>
        <linearGradient id={paintIds.hair} x1="0.12" y1="0" x2="0.82" y2="1">
          <stop offset="0%" stopColor={palette.hair.highlight} />
          <stop offset="32%" stopColor={palette.hair.base} />
          <stop offset="100%" stopColor={palette.hair.deep} />
        </linearGradient>
        <linearGradient id={paintIds.outfit} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.outfit.light} />
          <stop offset="55%" stopColor={palette.outfit.base} />
          <stop offset="100%" stopColor={palette.outfit.shadow} />
        </linearGradient>
        <linearGradient id={paintIds.hat} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={palette.hat.highlight} />
          <stop offset="52%" stopColor={palette.hat.base} />
          <stop offset="100%" stopColor={palette.hat.deep} />
        </linearGradient>
        <linearGradient id={paintIds.gear} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.gear.highlight} />
          <stop offset="46%" stopColor={palette.gear.base} />
          <stop offset="100%" stopColor={palette.gear.shadow} />
        </linearGradient>
        <linearGradient id={paintIds.pet} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={palette.pet.light} />
          <stop offset="55%" stopColor={palette.pet.base} />
          <stop offset="100%" stopColor={palette.pet.shadow} />
        </linearGradient>
        <filter id={paintIds.shadow} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="0.55" stdDeviation="0.45" floodColor="#020617" floodOpacity="0.34" />
        </filter>
      </defs>

      <circle cx="16" cy="16" r="16" fill={paint.background} />
      <ellipse cx="10" cy="7" rx="9" ry="7" fill="white" opacity="0.06" />
      <circle className="avatar-backdrop-orb" cx="26" cy="7" r="4.5" fill={palette.background.light} opacity="0.16" />
      <path d="M3,25 Q10,21 16,24 T29,23 L32,32 L0,32 Z" fill={palette.background.deep} opacity="0.3" />

      <g className="avatar-main-silhouette" filter={`url(#${paintIds.shadow})`}>
      {/* Accessories behind body (cape, wings, sword) — scaled to match body width */}
      {accessories.filter(a => a === 'cape' || a === 'wings' || a === 'sword').map(a => (
        <g key={a} transform={scaleAroundCenter(behindScale[a] || 1)}>
          {renderAccessory(a, accessoryColor)}
        </g>
      ))}

      {/* Neck */}
      <rect x="14" y="20" width="4" height="4" fill={headColor} />

      {/* Body / Shirt */}
      {renderBody(bodyShape, bodyColor)}
      {renderOutfitPattern(outfitPatternStyle, bodyShape)}

      {/* Head */}
      <HeadComponent color={headColor} />

      {/* Face features — shifted & scaled to align with head shape */}
      <g transform={headTransform(off.face, off.faceWidth)}>
        {/* Face extras (under eyes) */}
        {renderFaceExtra(faceExtraStyle)}

        {/* Eyes */}
        <EyesComponent color={eyeColor} />

        {/* Eyelids — head-colored ovals that briefly cover eyes to simulate blink */}
        {(EYELID_MODE[eyeStyle] === 'both' || EYELID_MODE[eyeStyle] === 'left') && (
          <ellipse className="avatar-eyelid" cx="12.75" cy="13.5" rx="2.8" ry="2.5" fill={headColor} />
        )}
        {EYELID_MODE[eyeStyle] === 'both' && (
          <ellipse className="avatar-eyelid" cx="19.25" cy="13.5" rx="2.8" ry="2.5" fill={headColor} />
        )}

        {/* Mouth — wrapped for breathing animation */}
        <g className="avatar-mouth">
          <MouthComponent color={mouthColor} mouthColor={mouthColor} />
        </g>
      </g>

      {/* Hair — shifted & scaled to align with head shape */}
      <g transform={headTransform(off.hair, off.width)}>
        {renderHair(hairStyle, hairColor)}
      </g>

      {/* Hat (on top of hair) — shifted & scaled to align with head shape */}
      <g transform={headTransform(off.hat, off.width)}>
        {renderHat(hatStyle, hatColor)}
      </g>

      {/* Accessories (front-facing, not cape/wings/sword) — scaled to body width */}
      {accessories.filter(a => a !== 'cape' && a !== 'wings' && a !== 'sword').map((a, i) => (
        <g key={a} className="avatar-accessory" transform={scaleAroundCenter((FRONT_ACCESSORY_SCALE[bodyShape] || {})[a] || 1)}>
          {renderAccessory(a, accessoryColor)}
          {i === 0 && <circle className="avatar-sparkle" cx="16" cy="23" r="0.6" fill="white" opacity="0" />}
        </g>
      ))}
      </g>

      <path
        className="avatar-rim-light"
        d="M9.5,10 Q10.8,5.8 15.2,5.2"
        fill="none"
        stroke="white"
        strokeWidth="0.48"
        strokeLinecap="round"
        opacity="0.24"
      />

      {/* Pet — wrapped for wiggle animation, grows with pet level */}
      <g className="avatar-pet">
        {(() => {
          // Per-pet XP: read from pet_xp_map for current pet, fallback to legacy
          const xpMap = config.pet_xp_map || {};
          const petXp = (petStyle && petStyle !== 'none' && petStyle in xpMap)
            ? xpMap[petStyle]
            : (config.pet_xp || 0);
          const thresholds = [0, 50, 150, 350, 700, 1200, 2000, 3500];
          let petLevel = 1;
          for (let i = 0; i < thresholds.length; i++) {
            if (petXp >= thresholds[i]) petLevel = i + 1;
          }
          // Scale 1.0 at lv1 up to 1.28 at lv8
          const sc = 1 + (petLevel - 1) * 0.04;
          const glowColor = petLevel >= 7 ? '#f59e0b' : petLevel >= 5 ? '#a855f7' : null;

          // Determine glow center based on position
          let px, py;
          if (petPosition === 'custom' && config.pet_x != null) {
            px = config.pet_x;
            py = config.pet_y ?? 20;
          } else {
            px = petPosition === 'left' ? 3 : petPosition === 'head' ? 16 : 26;
            py = petPosition === 'head' ? 4 : 20;
          }

          return (
            <>
              {glowColor && (
                <circle cx={px} cy={py} r={4} fill={glowColor} opacity="0.15" />
              )}
              <g transform={sc !== 1 ? `translate(${px},${py}) scale(${sc}) translate(${-px},${-py})` : undefined}>
                {renderPet(petStyle, petColors, petPosition, config)}
                {renderPetExtras(petStyle, petLevel, petColors, petPosition, config)}
                {renderPetAccessory(petStyle, config.pet_accessory, petPosition, config)}
              </g>
            </>
          );
        })()}
      </g>
    </svg>
  );
}

export default function AvatarDisplay({ config, size = 'md', name = '', animate = false }) {
  const px = SIZES[size] || SIZES.md;

  if (config && typeof config === 'object' && Object.keys(config).length > 0) {
    // Deterministic delay so grouped avatars desync their animations
    const delay = -(hashString(`${config.head}${config.hair}${config.eyes}${config.mouth}`) % 1200) / 100;

    return (
      <div
        className={`rounded-full overflow-hidden flex-shrink-0${animate ? ' avatar-idle' : ''}`}
        style={{ width: px, height: px, '--avatar-delay': `${delay}s` }}
      >
        <SvgAvatar config={config} size={px} />
      </div>
    );
  }

  // Fallback: colored circle with initials
  const bgColor = getColor(name);
  const initials = getInitials(name);
  const fontSize = px < 48 ? '0.65rem' : px < 96 ? '1rem' : '1.5rem';

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: px, height: px, backgroundColor: bgColor }}
    >
      <span className="font-heading text-navy leading-none" style={{ fontSize }}>
        {initials}
      </span>
    </div>
  );
}
