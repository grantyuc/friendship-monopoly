// Shared 3D dice face component — used by GameBoard and EffectModal
export function DiceFace({ value, size }: { value: number; size: number }) {
  const dotSize = size * 0.14;
  const positions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
  };
  const dots = positions[value] || positions[1];

  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #FFFFFF 0%, #E9ECEF 100%)',
        borderRadius: size * 0.15,
        border: `${size * 0.03}px solid #CED4DA`,
        position: 'relative',
        boxShadow: `
          ${size * 0.04}px ${size * 0.06}px 0 #ADB5BD,
          ${size * 0.08}px ${size * 0.12}px 0 #868E96,
          0 ${size * 0.15}px ${size * 0.3}px rgba(0,0,0,0.3)
        `,
      }}
    >
      {dots.map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #495057, #212529)',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
