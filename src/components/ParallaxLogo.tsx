import { useEffect, useRef, useState } from 'react';

export default function ParallaxLogo() {
  const logoRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const rotateX = mousePosition.y * 15;
  const rotateY = mousePosition.x * -15;
  const translateZ = Math.abs(mousePosition.x) + Math.abs(mousePosition.y) * 10;

  return (
    <div className="flex justify-center items-center py-12 perspective-[1000px]">
      <div
        ref={logoRef}
        className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(0, 255, 255, 0.6))',
            }}
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00FFFF', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0088FF', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            <polygon
              points="100,20 170,60 170,140 100,180 30,140 30,60"
              fill="url(#goldGrad)"
              stroke="url(#cyanGrad)"
              strokeWidth="3"
              className="hex-main"
            />

            <polygon
              points="100,40 150,70 150,130 100,160 50,130 50,70"
              fill="none"
              stroke="#00FFFF"
              strokeWidth="2"
              opacity="0.8"
            />

            <circle cx="100" cy="100" r="25" fill="url(#cyanGrad)" opacity="0.7" />

            <line x1="100" y1="20" x2="100" y2="180" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
            <line x1="30" y1="60" x2="170" y2="140" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
            <line x1="170" y1="60" x2="30" y2="140" stroke="#FFD700" strokeWidth="2" opacity="0.6" />

            <text
              x="100"
              y="108"
              textAnchor="middle"
              fontSize="32"
              fontWeight="bold"
              fill="#000"
              fontFamily="Arial, sans-serif"
            >
              CG
            </text>
          </svg>
        </div>

        <div
          className="absolute inset-0"
          style={{
            transform: 'translateZ(30px)',
            filter: 'blur(40px)',
            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(0,255,255,0.3) 50%, transparent 70%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-30 blur-xl"
          style={{
            transform: 'translateZ(-20px)',
            background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.2) 50%, transparent 70%)',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(0, 255, 255, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.8));
          }
        }
        .hex-main {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
