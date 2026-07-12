const PARTICLES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 100,
  delay: -((index * 0.73) % 8),
  duration: 7 + (index % 6),
  size: 8 + (index % 5) * 3,
  sway: (index % 2 === 0 ? 1 : -1) * (12 + (index % 4) * 6),
}));

const LIGHT_COLORS = ['#fef08a', '#fca5a5', '#86efac', '#93c5fd'];
const EGG_COLORS = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a'];


function ChristmasLayer() {
  return (
    <>
      <div className="seasonal-garland seasonal-garland-christmas">
        <span className="seasonal-evergreen seasonal-evergreen-left">🌲</span>
        <div className="seasonal-light-string">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className="seasonal-light"
              style={{
                '--seasonal-index': index,
                backgroundColor: LIGHT_COLORS[index % LIGHT_COLORS.length],
              }}
            />
          ))}
        </div>
        <span className="seasonal-evergreen seasonal-evergreen-right">🌲</span>
      </div>

      <div className="seasonal-particles seasonal-snow-field">
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="seasonal-particle seasonal-snowflake"
            style={{
              '--seasonal-left': `${particle.left}%`,
              '--seasonal-delay': `${particle.delay}s`,
              '--seasonal-duration': `${particle.duration}s`,
              '--seasonal-size': `${particle.size}px`,
              '--seasonal-sway': `${particle.sway}px`,
            }}
          >
            ❄
          </span>
        ))}
      </div>

      <div className="seasonal-corner seasonal-corner-left">🎁</div>
      <div className="seasonal-corner seasonal-corner-right">🛷</div>
      <div className="seasonal-bottom seasonal-snow-bank" />
    </>
  );
}

function EasterLayer() {
  return (
    <>
      <div className="seasonal-garland seasonal-garland-easter">
        <span className="seasonal-spring-branch">🌿</span>
        <div className="seasonal-egg-row">
          {EGG_COLORS.map((color, index) => (
            <span
              key={color}
              className="seasonal-egg"
              style={{ '--egg-color': color, '--seasonal-index': index }}
            />
          ))}
        </div>
        <span className="seasonal-spring-branch seasonal-spring-branch-right">🌿</span>
      </div>

      <div className="seasonal-particles seasonal-petal-field">
        {PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="seasonal-particle seasonal-petal"
            style={{
              '--seasonal-left': `${particle.left}%`,
              '--seasonal-delay': `${particle.delay}s`,
              '--seasonal-duration': `${particle.duration + 3}s`,
              '--seasonal-size': `${Math.max(8, particle.size - 2)}px`,
              '--seasonal-sway': `${particle.sway * 1.7}px`,
              '--petal-color': EGG_COLORS[particle.id % EGG_COLORS.length],
            }}
          />
        ))}
      </div>

      <div className="seasonal-corner seasonal-corner-left seasonal-bunny">🐇</div>
      <div className="seasonal-corner seasonal-corner-right">🐣</div>
      <div className="seasonal-bottom seasonal-grass-bank" />
    </>
  );
}

export default function SeasonalThemeLayer({ theme }) {
  if (theme !== 'christmas' && theme !== 'easter') return null;

  return (
    <div
      className={`seasonal-theme-layer seasonal-theme-${theme} fixed inset-0 z-[1] overflow-hidden pointer-events-none`}
      aria-hidden="true"
    >
      {theme === 'christmas' ? <ChristmasLayer /> : <EasterLayer />}
    </div>
  );
}
