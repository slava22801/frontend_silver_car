import React from 'react';

export default function AnimatedWheel() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes moveLeftRight {
          0% {
            left: -150px;
          }
          50% {
            left: calc(100vw - 50px);
          }
          100% {
            left: -150px;
          }
        }
        .wheel-container {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          animation: moveLeftRight 20s linear infinite;
          opacity: 0.1;
        }
        .wheel-svg {
          animation: rotate 2s linear infinite;
        }
      `}</style>
      <div className="wheel-container">
        <svg
          className="wheel-svg w-32 h-32 md:w-48 md:h-48 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 200 200"
        >
          {/* Внешний обод шины */}
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="8" />
          {/* Внутренний обод */}
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="4" />
          {/* Центральная ступица */}
          <circle cx="100" cy="100" r="15" fill="currentColor" />
          {/* Спицы */}
          <line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="100" y2="190" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="10" y2="100" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="154" y2="46" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="154" y2="154" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="46" y2="154" stroke="currentColor" strokeWidth="4" />
          <line x1="100" y1="100" x2="46" y2="46" stroke="currentColor" strokeWidth="4" />
          {/* Протектор шины */}
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

