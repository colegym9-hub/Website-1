"use client"

// ─── Topographic background SVG ────────────────────────────────────────────
// Renders faint organic contour lines across the full canvas height.
// Used as a fixed background on the /work page.

export default function TopographicBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <style>{`
            .topo-line {
              fill: none;
              stroke: #7fb8be;
              stroke-opacity: 0.07;
              stroke-width: 1;
              stroke-dasharray: 6 10;
            }
          `}</style>
        </defs>

        {/* Layer 1 — wide sweeping curves */}
        <path className="topo-line" d="M-200,180 C100,80 400,320 700,180 S1200,60 1600,200 S2000,380 2400,240" />
        <path className="topo-line" d="M-200,340 C150,240 380,480 680,320 S1150,180 1550,360 S2050,540 2400,400" />
        <path className="topo-line" d="M-200,520 C200,400 440,640 740,480 S1300,300 1700,520 S2100,700 2400,560" />
        <path className="topo-line" d="M-200,700 C250,580 480,820 780,640 S1250,440 1650,680 S2050,860 2400,740" />
        <path className="topo-line" d="M-200,900 C300,780 520,1000 820,820 S1350,600 1750,840 S2150,1020 2400,900" />

        {/* Layer 2 — tighter inner contours, slightly offset */}
        <path className="topo-line" style={{ strokeOpacity: 0.05 }} d="M-200,260 C120,160 360,400 660,260 S1180,120 1580,300 S2020,460 2400,320" />
        <path className="topo-line" style={{ strokeOpacity: 0.05 }} d="M-200,440 C170,320 400,560 700,400 S1220,240 1620,440 S2080,620 2400,480" />
        <path className="topo-line" style={{ strokeOpacity: 0.05 }} d="M-200,620 C220,500 460,740 760,560 S1280,380 1680,600 S2100,780 2400,640" />
        <path className="topo-line" style={{ strokeOpacity: 0.05 }} d="M-200,820 C270,700 500,940 800,760 S1320,560 1720,780 S2140,960 2400,820" />
        <path className="topo-line" style={{ strokeOpacity: 0.05 }} d="M-200,1020 C320,900 560,1120 860,940 S1380,720 1780,960 S2180,1140 2400,1020" />

        {/* Layer 3 — diagonal accent lines */}
        <path className="topo-line" style={{ strokeOpacity: 0.04 }} d="M-100,0 C200,300 500,100 800,400 S1200,200 1500,500 S1900,300 2200,600" />
        <path className="topo-line" style={{ strokeOpacity: 0.04 }} d="M200,0 C500,280 780,80 1080,360 S1480,160 1780,460 S2100,260 2400,560" />
        <path className="topo-line" style={{ strokeOpacity: 0.04 }} d="M600,0 C880,240 1100,60 1380,320 S1720,120 2020,400 S2280,200 2400,360" />

        {/* Closed loop shapes — organic islands */}
        <ellipse className="topo-line" style={{ strokeOpacity: 0.06 }} cx="400" cy="450" rx="280" ry="120" transform="rotate(-12 400 450)" />
        <ellipse className="topo-line" style={{ strokeOpacity: 0.04 }} cx="400" cy="450" rx="360" ry="180" transform="rotate(-12 400 450)" />
        <ellipse className="topo-line" style={{ strokeOpacity: 0.06 }} cx="1400" cy="750" rx="320" ry="140" transform="rotate(8 1400 750)" />
        <ellipse className="topo-line" style={{ strokeOpacity: 0.04 }} cx="1400" cy="750" rx="420" ry="200" transform="rotate(8 1400 750)" />
        <ellipse className="topo-line" style={{ strokeOpacity: 0.05 }} cx="960" cy="300" rx="200" ry="80" transform="rotate(-5 960 300)" />
        <ellipse className="topo-line" style={{ strokeOpacity: 0.04 }} cx="960" cy="300" rx="280" ry="130" transform="rotate(-5 960 300)" />
      </svg>
    </div>
  )
}
