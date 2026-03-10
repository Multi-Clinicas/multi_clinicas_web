interface NoShowFlowSvgProps {
  mainStrokeWidth: number;
  branchStrokeWidth: number;
  solidNodes: number;
  missedNodes: number;
  travelDuration: string;
  branchDuration: string;
}

export default function NoShowFlowSvg({
  mainStrokeWidth,
  branchStrokeWidth,
  solidNodes,
  missedNodes,
  travelDuration,
  branchDuration,
}: NoShowFlowSvgProps) {
  return (
    <svg viewBox="0 0 360 118" className="mx-auto h-auto w-full max-w-[760px]" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ghostBranch" x1="164" y1="54" x2="252" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ghostFill" x1="164" y1="54" x2="252" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="text-text-muted/70">
        <path
          d="M24 54 H304"
          stroke="currentColor"
          strokeWidth={mainStrokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M164 54 C186 56 198 70 214 83 C227 94 239 101 252 106"
          stroke="url(#ghostBranch)"
          strokeWidth={branchStrokeWidth}
          strokeLinecap="round"
          strokeDasharray="5 9"
        />
        <path
          d="M164 54 C186 56 198 70 214 83 C227 94 239 101 252 106 L252 118 L164 118 Z"
          fill="url(#ghostFill)"
        />
      </g>

      <g className="text-accent-primary">
        {Array.from({ length: solidNodes }).map((_, index) => (
          <circle key={`solid-${index}`} r="4" fill="currentColor">
            <animateMotion
              dur={travelDuration}
              begin={`${index * 0.7}s`}
              repeatCount="indefinite"
              path="M30 54 H292"
            />
          </circle>
        ))}
      </g>

      <g className="text-text-muted/80">
        {Array.from({ length: missedNodes }).map((_, index) => (
          <circle
            key={`ghost-${index}`}
            r="4"
            fill="var(--color-surface-card)"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <animateMotion
              dur={branchDuration}
              begin={`${index * 1.1}s`}
              repeatCount="indefinite"
              path="M164 54 C186 56 198 70 214 83 C227 94 239 101 252 106"
            />
          </circle>
        ))}
      </g>

      <g transform="translate(304 22)">
        <rect
          x="0.75"
          y="18.75"
          width="38.5"
          height="44.5"
          rx="8"
          fill="var(--color-surface-card)"
          stroke="var(--color-border-default)"
          strokeWidth="1.5"
        />
        <path d="M9 54 H31" className="stroke-accent-primary" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 44 H31" className="stroke-text-muted" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 34 H31" className="stroke-text-muted" strokeWidth="1.5" strokeLinecap="round" />
        <rect
          x="12"
          y="4"
          width="16"
          height="14"
          rx="4"
          fill="var(--color-accent-subtle)"
          stroke="var(--color-accent-primary)"
          strokeWidth="1.5"
        />
        <path d="M20 8 V14" className="stroke-accent-primary" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 11 H23" className="stroke-accent-primary" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}