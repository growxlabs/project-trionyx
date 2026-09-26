'use client';

import React, { useState } from 'react';
import {
  MAP_CONFIG,
  ORIGIN_CITY,
  NETWORK_CITIES,
  INDIA_PATH,
  WORLD_LAND_PATH,
} from './worldMapData';

export const WorldNetworkMap: React.FC = () => {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  // Bezier arc generation from Vijayawada to destination
  const createArc = (toX: number, toY: number) => {
    const fromX = ORIGIN_CITY.x;
    const fromY = ORIGIN_CITY.y;
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    // Slight curvature
    const curvature = 0.18;
    const cx = midX - dy * curvature;
    const cy = midY + dx * curvature;
    return `M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`;
  };

  const activeDestination = NETWORK_CITIES.find((c) => c.id === activeCity);

  return (
    <div className="relative w-full select-none">
      {/* Dynamic Keyframe Animations for SVG Paths */}
      <style jsx>{`
        @keyframes drawWorldRoute {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes flowPacket {
          0% {
            stroke-dashoffset: 60;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes radarWave {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          60% {
            transform: scale(2.8);
            opacity: 0;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
        @keyframes pulseIndiaCore {
          0%, 100% {
            opacity: 0.22;
          }
          50% {
            opacity: 0.42;
          }
        }
        .world-route {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawWorldRoute 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .flow-packet {
          stroke-dasharray: 3 14;
          animation: flowPacket 2.2s linear infinite;
        }
        .india-highlight-fill {
          animation: pulseIndiaCore 4s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Canvas Container */}
      <div className="w-full relative overflow-hidden rounded-2xl border border-[rgba(23,23,20,0.06)] bg-[#F4F3ED]/50 p-2 sm:p-4 lg:p-6 backdrop-blur-[2px]">
        <svg
          viewBox={MAP_CONFIG.viewBox}
          className="w-full h-auto max-h-[640px] lg:max-h-[720px] overflow-visible"
          aria-label="World map with India highlighted and Vijayawada operational hub"
        >
          <defs>
            {/* Ambient Orange Glow Filter for India */}
            <filter id="indiaGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F26522" floodOpacity="0.55" />
            </filter>

            {/* Origin Hub Glow */}
            <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F26522" floodOpacity="0.7" />
            </filter>

            {/* Route Gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F26522" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#171714" stopOpacity="0.3" />
            </linearGradient>

            {/* Hover Route Gradient */}
            <linearGradient id="routeHoverGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F26522" stopOpacity="1" />
              <stop offset="100%" stopColor="#F26522" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* 1. ARCHITECTURAL GRATICULE & COORDINATE AXES */}
          <g opacity="0.3" stroke="rgba(23, 23, 20, 0.08)" strokeWidth="0.6" strokeDasharray="3 4">
            <line x1="0" y1={MAP_CONFIG.equatorY} x2={MAP_CONFIG.width} y2={MAP_CONFIG.equatorY} />
            <line x1="0" y1={MAP_CONFIG.tropicCancerY} x2={MAP_CONFIG.width} y2={MAP_CONFIG.tropicCancerY} />
            <line x1="0" y1={MAP_CONFIG.tropicCapricornY} x2={MAP_CONFIG.width} y2={MAP_CONFIG.tropicCapricornY} />
            <line x1={MAP_CONFIG.primeMeridianX} y1="0" x2={MAP_CONFIG.primeMeridianX} y2={MAP_CONFIG.height} />
            <line
              x1={MAP_CONFIG.vijayawadaMeridianX}
              y1="0"
              x2={MAP_CONFIG.vijayawadaMeridianX}
              y2={MAP_CONFIG.height}
              stroke="rgba(242, 101, 34, 0.2)"
              strokeDasharray="2 4"
            />
          </g>

          {/* 2. UNIFIED WORLD CONTINENTS (SEAMLESS LANDMASSES, NO COUNTRY BORDERS) */}
          <path
            d={WORLD_LAND_PATH}
            fill="rgba(23, 23, 20, 0.04)"
            stroke="rgba(23, 23, 20, 0.13)"
            strokeWidth="0.85"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 3. INDIA HIGHLIGHT: Complete Official Boundary (Jammu & Kashmir, Ladakh included) in Vibrant Trionyx Orange */}
          <g filter="url(#indiaGlow)">
            {/* Primary Orange Fill & Vibrant Stroke */}
            <path
              d={INDIA_PATH}
              fill="rgba(242, 101, 34, 0.3)"
              stroke="#F26522"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Inner pulsing core fill */}
            <path
              d={INDIA_PATH}
              fill="#F26522"
              className="india-highlight-fill"
              stroke="none"
            />
          </g>

          {/* 4. DISTRIBUTION ROUTES FROM VIJAYAWADA TO KEY INDIAN HUBS */}
          <g className="routes-layer">
            {NETWORK_CITIES.map((city) => {
              const arc = createArc(city.x, city.y);
              const isHovered = activeCity === city.id;

              return (
                <g key={`world-route-${city.id}`}>
                  <path
                    d={arc}
                    fill="none"
                    stroke={isHovered ? 'url(#routeHoverGradient)' : 'url(#routeGradient)'}
                    strokeWidth={isHovered ? 1.75 : 1}
                    strokeLinecap="round"
                    className="world-route"
                    style={{ animationDelay: city.delay }}
                  />
                  <path
                    d={arc}
                    fill="none"
                    stroke={isHovered ? '#F26522' : 'rgba(242, 101, 34, 0.7)'}
                    strokeWidth={isHovered ? 2 : 1.25}
                    strokeLinecap="round"
                    className="flow-packet"
                    opacity={isHovered ? 1 : 0.8}
                  />
                </g>
              );
            })}
          </g>

          {/* 5. DESTINATION NODES ACROSS INDIA */}
          <g className="destinations-layer">
            {NETWORK_CITIES.map((city) => {
              const isHovered = activeCity === city.id;

              return (
                <g
                  key={`dest-node-${city.id}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActiveCity(city.id)}
                  onMouseLeave={() => setActiveCity(null)}
                >
                  <circle cx={city.x} cy={city.y} r={8} fill="transparent" />
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isHovered ? 4.5 : 2.5}
                    fill={isHovered ? '#F26522' : 'rgba(23, 23, 20, 0.4)'}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isHovered ? 2.5 : 1.5}
                    fill="#FCFBF7"
                    stroke={isHovered ? '#F26522' : '#171714'}
                    strokeWidth={0.75}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </g>

          {/* 6. ORIGIN HUB: VIJAYAWADA (PULSING BEACON & CALLOUT) */}
          <g
            className="origin-beacon cursor-pointer"
            style={{ transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px` }}
            onMouseEnter={() => setActiveCity(ORIGIN_CITY.id)}
            onMouseLeave={() => setActiveCity(null)}
          >
            {/* Radar wave 1 */}
            <circle
              cx={ORIGIN_CITY.x}
              cy={ORIGIN_CITY.y}
              r={7}
              fill="none"
              stroke="#F26522"
              strokeWidth="1.2"
              opacity="0.85"
              style={{
                animation: 'radarWave 2.6s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px`,
              }}
            />

            {/* Radar wave 2 */}
            <circle
              cx={ORIGIN_CITY.x}
              cy={ORIGIN_CITY.y}
              r={12}
              fill="none"
              stroke="#F26522"
              strokeWidth="0.8"
              opacity="0.45"
              style={{
                animation: 'radarWave 2.6s cubic-bezier(0, 0.2, 0.8, 1) 0.8s infinite',
                transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px`,
              }}
            />

            {/* Solid Origin Beacon */}
            <circle
              cx={ORIGIN_CITY.x}
              cy={ORIGIN_CITY.y}
              r={4}
              fill="#FCFBF7"
              stroke="#F26522"
              strokeWidth="1.75"
              filter="url(#hubGlow)"
            />
            <circle cx={ORIGIN_CITY.x} cy={ORIGIN_CITY.y} r={2} fill="#F26522" />

            {/* Architectural Callout Indicator Line for Vijayawada */}
            <g opacity="0.95">
              <polyline
                points={`${ORIGIN_CITY.x} ${ORIGIN_CITY.y + 4} ${ORIGIN_CITY.x + 12} ${ORIGIN_CITY.y + 24} ${ORIGIN_CITY.x + 95} ${ORIGIN_CITY.y + 24}`}
                fill="none"
                stroke="#F26522"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={ORIGIN_CITY.x + 95} cy={ORIGIN_CITY.y + 24} r={2} fill="#F26522" />

              <g transform={`translate(${ORIGIN_CITY.x + 16}, ${ORIGIN_CITY.y + 18})`}>
                <text
                  x="0"
                  y="0"
                  className="font-mono text-[9px] font-bold tracking-[0.14em] fill-[#171714]"
                >
                  VIJAYAWADA
                </text>
                <text
                  x="0"
                  y="10"
                  className="font-mono text-[7px] font-semibold tracking-[0.16em] uppercase fill-[#F26522]"
                >
                  ORIGIN / CENTRAL HUB
                </text>
              </g>
            </g>
          </g>

          {/* Active Hover Callout for Destination Nodes */}
          {activeDestination && (
            <g transform={`translate(${activeDestination.x}, ${activeDestination.y - 12})`}>
              <rect
                x="-38"
                y="-18"
                width="76"
                height="16"
                rx="3"
                fill="#171714"
                opacity="0.92"
              />
              <text
                x="0"
                y="-7"
                textAnchor="middle"
                className="font-mono text-[7.5px] font-semibold fill-[#FCFBF7] tracking-wider"
              >
                {activeDestination.name}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
