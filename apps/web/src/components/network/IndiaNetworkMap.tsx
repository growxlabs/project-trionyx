'use client';

import React, { useState } from 'react';

export interface NetworkCity {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  labelPosition: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  delay: string;
}

// Origin Point: VIJAYAWADA (Andhra Pradesh, South-Central East Coast)
export const ORIGIN_CITY = {
  id: 'vijayawada',
  name: 'VIJAYAWADA',
  role: 'ORIGIN & DISTRIBUTION HUB',
  x: 462,
  y: 625,
};

// Key Distribution Network Destinations across all Indian zones
export const NETWORK_CITIES: NetworkCity[] = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    region: 'North',
    x: 375,
    y: 285,
    labelPosition: 'top-right',
    delay: '0.15s',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    region: 'West',
    x: 235,
    y: 425,
    labelPosition: 'left',
    delay: '0.3s',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'West',
    x: 260,
    y: 555,
    labelPosition: 'left',
    delay: '0.42s',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'Central',
    x: 410,
    y: 585,
    labelPosition: 'top-left',
    delay: '0.2s',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'East',
    x: 605,
    y: 445,
    labelPosition: 'right',
    delay: '0.35s',
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    region: 'North East',
    x: 710,
    y: 360,
    labelPosition: 'top-right',
    delay: '0.5s',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'South West',
    x: 385,
    y: 725,
    labelPosition: 'left',
    delay: '0.28s',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'South East',
    x: 480,
    y: 720,
    labelPosition: 'right',
    delay: '0.22s',
  },
  {
    id: 'kochi',
    name: 'Kochi',
    region: 'South',
    x: 370,
    y: 815,
    labelPosition: 'bottom-left',
    delay: '0.45s',
  },
];

// Architectural India Boundary Path
const INDIA_BORDER_PATH = `
  M 360 70
  C 375 60, 400 55, 420 85
  C 440 115, 455 140, 440 175
  C 430 195, 455 210, 475 220
  C 505 235, 535 250, 545 265
  C 555 260, 570 245, 590 250
  C 615 255, 640 230, 680 230
  C 720 230, 755 245, 765 275
  C 770 305, 750 340, 730 365
  C 715 385, 685 410, 665 420
  C 650 405, 635 380, 620 380
  C 605 380, 595 410, 595 440
  C 595 465, 575 495, 555 520
  C 530 550, 500 580, 480 615
  C 465 640, 475 680, 485 715
  C 490 750, 475 790, 450 830
  C 435 855, 420 875, 410 870
  C 395 860, 380 830, 365 790
  C 350 750, 335 700, 315 650
  C 295 600, 265 570, 255 545
  C 245 520, 260 500, 255 480
  C 245 460, 210 475, 185 465
  C 165 455, 170 425, 195 410
  C 220 395, 235 385, 215 370
  C 195 355, 205 340, 230 330
  C 260 320, 280 290, 300 260
  C 320 230, 335 190, 345 150
  C 350 120, 350 90, 360 70
  Z
`;

export const IndiaNetworkMap: React.FC = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Generate subtle curved Bezier route arc from Vijayawada to destination
  const createArc = (toX: number, toY: number) => {
    const fromX = ORIGIN_CITY.x;
    const fromY = ORIGIN_CITY.y;
    // Midpoint with gentle perpendicular offset for natural curvature
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    // Offset curvature based on trajectory
    const curvature = 0.14;
    const cx = midX - dy * curvature;
    const cy = midY + dx * curvature;
    return `M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
      {/* Dynamic CSS animations for SVG route drawing & pulses */}
      <style jsx>{`
        @keyframes drawRoute {
          0% {
            stroke-dashoffset: 800;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes flowPacket {
          0% {
            stroke-dashoffset: 160;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pingOrigin {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(2.6);
            opacity: 0;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }
        @keyframes nodeAppear {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .route-path {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: drawRoute 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .pulse-packet {
          stroke-dasharray: 6 32;
          animation: flowPacket 3.2s linear infinite;
        }
        .node-pop {
          animation: nodeAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <svg
        viewBox="100 20 700 870"
        className="w-full h-auto max-h-[640px] lg:max-h-[700px] overflow-visible"
        aria-label="Interactive Trionyx India Network Map centered at Vijayawada"
      >
        <defs>
          {/* Subtle warm drop shadow for nodes */}
          <filter id="originGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#F26522" floodOpacity="0.35" />
          </filter>

          {/* Linear gradient for routes starting from Vijayawada */}
          <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F26522" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#171714" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#171714" stopOpacity="0.18" />
          </linearGradient>

          {/* Active hover gradient */}
          <linearGradient id="routeHoverGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F26522" stopOpacity="1" />
            <stop offset="100%" stopColor="#F26522" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* 1. ARCHITECTURAL BACKGROUND: Subtle Coordinate Grid & Crosshairs */}
        <g opacity="0.45" stroke="rgba(23, 23, 20, 0.08)" strokeWidth="0.75" strokeDasharray="3 6">
          <line x1="140" y1="285" x2="760" y2="285" /> {/* 28°N Latitude */}
          <line x1="140" y1="445" x2="760" y2="445" /> {/* 22°N Latitude */}
          <line x1="140" y1="625" x2="760" y2="625" /> {/* Vijayawada ~16.5°N */}
          <line x1="140" y1="720" x2="760" y2="720" /> {/* 13°N Latitude */}
          <line x1="260" y1="60" x2="260" y2="860" />  {/* 72°E Longitude */}
          <line x1="375" y1="60" x2="375" y2="860" />  {/* 77°E Longitude */}
          <line x1="462" y1="60" x2="462" y2="860" />  {/* 80.6°E Vijayawada */}
          <line x1="605" y1="60" x2="605" y2="860" />  {/* 88°E Longitude */}
        </g>

        {/* Coordinate Crosshairs */}
        <g opacity="0.3" stroke="#171714" strokeWidth="1">
          <path d="M 457 625 L 467 625 M 462 620 L 462 630" />
          <path d="M 370 285 L 380 285 M 375 280 L 375 290" />
          <path d="M 255 555 L 265 555 M 260 550 L 260 560" />
          <path d="M 600 445 L 610 445 M 605 440 L 605 450" />
        </g>

        {/* 2. INDIA CONTOUR SILHOUETTE: Clean architectural geometry */}
        <path
          d={INDIA_BORDER_PATH}
          fill="rgba(23, 23, 20, 0.022)"
          stroke="rgba(23, 23, 20, 0.16)"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Subtle inner terrain contour ring */}
        <path
          d={INDIA_BORDER_PATH}
          fill="none"
          stroke="rgba(242, 101, 34, 0.04)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* 3. OUTWARD ROUTE LINES: Drawing outward from Vijayawada */}
        <g className="routes-layer">
          {NETWORK_CITIES.map((city) => {
            const arcPath = createArc(city.x, city.y);
            const isHovered = hoveredCity === city.id;

            return (
              <g key={`route-group-${city.id}`}>
                {/* Base Route Line */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={isHovered ? 'url(#routeHoverGradient)' : 'url(#routeGradient)'}
                  strokeWidth={isHovered ? 2.25 : 1.25}
                  strokeLinecap="round"
                  className="route-path"
                  style={{ animationDelay: city.delay }}
                />

                {/* Flowing energy packet traveling outward continuously */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={isHovered ? '#F26522' : 'rgba(242, 101, 34, 0.45)'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeLinecap="round"
                  className="pulse-packet"
                  opacity={isHovered ? 1 : 0.65}
                />
              </g>
            );
          })}
        </g>

        {/* 4. DESTINATION NETWORK NODES: Key cities across India */}
        <g className="destinations-layer">
          {NETWORK_CITIES.map((city) => {
            const isHovered = hoveredCity === city.id;

            // Offset label position
            let labelX = city.x;
            let labelY = city.y - 12;
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';

            if (city.labelPosition === 'left') {
              labelX = city.x - 12;
              labelY = city.y + 4;
              textAnchor = 'end';
            } else if (city.labelPosition === 'right') {
              labelX = city.x + 12;
              labelY = city.y + 4;
              textAnchor = 'start';
            } else if (city.labelPosition === 'top-right') {
              labelX = city.x + 10;
              labelY = city.y - 10;
              textAnchor = 'start';
            } else if (city.labelPosition === 'top-left') {
              labelX = city.x - 10;
              labelY = city.y - 10;
              textAnchor = 'end';
            } else if (city.labelPosition === 'bottom-left') {
              labelX = city.x - 10;
              labelY = city.y + 16;
              textAnchor = 'end';
            }

            return (
              <g
                key={`node-${city.id}`}
                className="node-pop cursor-pointer group"
                style={{
                  transformOrigin: `${city.x}px ${city.y}px`,
                  animationDelay: `${parseFloat(city.delay) + 0.6}s`,
                }}
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Invisible hit target for smooth hover */}
                <circle cx={city.x} cy={city.y} r={16} fill="transparent" />

                {/* Subtle arrival ping on node */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isHovered ? 8 : 5}
                  fill={isHovered ? 'rgba(242, 101, 34, 0.18)' : 'rgba(23, 23, 20, 0.08)'}
                  className="transition-all duration-200"
                />

                {/* Solid Destination Point */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isHovered ? 4.5 : 3.5}
                  fill={isHovered ? '#F26522' : '#171714'}
                  stroke="#FCFBF7"
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* City Name Label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  className={`font-mono text-[11px] sm:text-[11.5px] tracking-wide transition-colors duration-200 ${
                    isHovered ? 'fill-[#F26522] font-bold' : 'fill-[#68665F] font-medium'
                  }`}
                >
                  {city.name}
                </text>

                {/* Regional tag (only appears on hover) */}
                {isHovered && (
                  <text
                    x={labelX}
                    y={labelY + 12}
                    textAnchor={textAnchor}
                    className="font-mono text-[9px] uppercase tracking-widest fill-[#8C897E]"
                  >
                    {city.region} Zone
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 5. ORIGIN NODE: VIJAYAWADA (The Source Beacon) */}
        <g
          className="origin-beacon cursor-pointer"
          style={{ transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px` }}
        >
          {/* Radar ripple rings expanding outward */}
          <circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={16}
            fill="none"
            stroke="#F26522"
            strokeWidth="1.5"
            opacity="0.75"
            style={{
              animation: 'pingOrigin 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite',
              transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px`,
            }}
          />
          <circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={24}
            fill="none"
            stroke="#F26522"
            strokeWidth="1"
            opacity="0.35"
            style={{
              animation: 'pingOrigin 2.8s cubic-bezier(0, 0.2, 0.8, 1) 0.9s infinite',
              transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px`,
            }}
          />

          {/* Distinct Outer Ring */}
          <circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={8}
            fill="#FCFBF7"
            stroke="#F26522"
            strokeWidth="2"
            filter="url(#originGlow)"
          />

          {/* Solid Brand Orange Core */}
          <circle cx={ORIGIN_CITY.x} cy={ORIGIN_CITY.y} r={4.5} fill="#F26522" />

          {/* Vijayawada Label Group */}
          <g transform={`translate(${ORIGIN_CITY.x + 14}, ${ORIGIN_CITY.y + 4})`}>
            {/* Primary Origin Label */}
            <text
              x="0"
              y="0"
              className="font-mono text-[13px] sm:text-[14px] font-bold tracking-wider fill-[#171714]"
            >
              {ORIGIN_CITY.name}
            </text>

            {/* Hub Descriptor */}
            <text
              x="0"
              y="13"
              className="font-mono text-[9.5px] uppercase tracking-[0.16em] font-semibold fill-[#F26522]"
            >
              ORIGIN / HUB
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
