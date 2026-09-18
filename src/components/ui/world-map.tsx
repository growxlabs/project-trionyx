'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ORIGIN_CITY,
  DESTINATIONS,
  INDIA_DOTS,
  WORLD_DOTS_PATH,
  MapDestination,
} from '../network/dottedMapData';

export interface WorldMapProps {
  className?: string;
}

// Custom curvature offsets for each destination to fan out gracefully without overlapping
const ROUTE_CURVATURES: Record<string, number> = {
  delhi: 0.26,
  mumbai: 0.22,
  ahmedabad: 0.28,
  kolkata: -0.24,
  hyderabad: 0.32,
  bengaluru: -0.18,
  chennai: -0.25,
  kochi: -0.22,
};

export const WorldMap: React.FC<WorldMapProps> = ({ className = '' }) => {
  const [hoveredDest, setHoveredDest] = useState<MapDestination | null>(null);

  // Generate smooth curved Bezier route from Vijayawada to destination
  const createCurvedPath = (toX: number, toY: number, destId: string) => {
    const fromX = ORIGIN_CITY.x;
    const fromY = ORIGIN_CITY.y;
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const curvature = ROUTE_CURVATURES[destId] ?? 0.2;
    const cx = midX - dy * curvature;
    const cy = midY + dx * curvature;
    return `M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`;
  };

  return (
    <div className={`relative w-full select-none overflow-visible ${className}`}>
      <svg
        viewBox="0 15 1188 550"
        className="w-full h-auto max-h-[600px] lg:max-h-[660px] overflow-visible"
        aria-label="Aceternity-style dotted geographic world map with India and Vijayawada network highlighted"
      >
        <defs>
          {/* Subtle soft orange glow for origin */}
          <filter id="originPulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F26522" floodOpacity="0.6" />
          </filter>

          {/* Route line subtle gradient */}
          <linearGradient id="trionyxRouteGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F26522" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F26522" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* 1. WORLD DOTS: Raised contrast (rgba(23, 23, 20, 0.18)), low contrast but clearly visible continents */}
        <motion.path
          d={WORLD_DOTS_PATH}
          fill="rgba(23, 23, 20, 0.18)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* 2. INDIA DOTS: Distinct Trionyx orange accent tone, prominent radius */}
        <g className="india-dots-layer">
          {INDIA_DOTS.map((dot, idx) => (
            <motion.circle
              key={`ind-dot-${idx}`}
              cx={dot.x}
              cy={dot.y}
              r={2.05}
              initial={{ fill: 'rgba(23, 23, 20, 0.18)', scale: 0.8, opacity: 0.3 }}
              animate={{ fill: '#F26522', scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5 + (idx % 12) * 0.04,
                ease: 'easeOut',
              }}
            />
          ))}
        </g>

        {/* 3. INDIA NETWORK ROUTES: Clearly visible, elegant, thin animated curves */}
        <g className="routes-layer">
          {DESTINATIONS.map((dest) => {
            const pathD = createCurvedPath(dest.x, dest.y, dest.id);
            const isHovered = hoveredDest?.id === dest.id;

            return (
              <g key={`route-${dest.id}`}>
                {/* Route stroke with enhanced weight and opacity for crisp legibility */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? '#F26522' : 'url(#trionyxRouteGradient)'}
                  strokeWidth={isHovered ? 2.4 : 1.65}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isHovered ? 1 : 0.85 }}
                  transition={{
                    pathLength: {
                      duration: 1.5,
                      delay: dest.delay,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: {
                      duration: 0.4,
                      delay: dest.delay,
                    },
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* 4. DESTINATION POINTS ACROSS INDIA */}
        <g className="destinations-layer">
          {DESTINATIONS.map((dest) => {
            const isHovered = hoveredDest?.id === dest.id;

            return (
              <g
                key={`node-${dest.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDest(dest)}
                onMouseLeave={() => setHoveredDest(null)}
              >
                {/* Generous hit area for smooth hover interaction */}
                <circle cx={dest.x} cy={dest.y} r={10} fill="transparent" />

                {/* Destination Point Halo on Hover */}
                <motion.circle
                  cx={dest.x}
                  cy={dest.y}
                  r={isHovered ? 6 : 0}
                  fill="rgba(242, 101, 34, 0.2)"
                  transition={{ duration: 0.2 }}
                />

                {/* Destination Point */}
                <motion.circle
                  cx={dest.x}
                  cy={dest.y}
                  r={isHovered ? 3.4 : 2.5}
                  fill={isHovered ? '#F26522' : '#171714'}
                  stroke="#F7F6F0"
                  strokeWidth={1}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: dest.delay + 0.6,
                    ease: 'easeOut',
                  }}
                />

                {/* Clean hover tooltip with city name */}
                {isHovered && (
                  <g transform={`translate(${dest.x}, ${dest.y - 10})`}>
                    <rect
                      x="-32"
                      y="-15"
                      width="64"
                      height="15"
                      rx="3"
                      fill="#171714"
                      opacity="0.92"
                    />
                    <text
                      x="0"
                      y="-4.5"
                      textAnchor="middle"
                      className="font-mono text-[7px] font-semibold fill-[#F7F6F0] tracking-wider"
                    >
                      {dest.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 5. VIJAYAWADA ORIGIN MARKER: Real geographic position (16.5062°N, 80.6480°E) */}
        <g className="origin-marker">
          {/* Restrained pulse ring 1 */}
          <motion.circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={6}
            fill="none"
            stroke="#F26522"
            strokeWidth={1}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 2.5, 2.5],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2.8,
              delay: 1.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px` }}
          />

          {/* Restrained pulse ring 2 */}
          <motion.circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={10}
            fill="none"
            stroke="#F26522"
            strokeWidth={0.7}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 2.3, 2.3],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2.8,
              delay: 2.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: `${ORIGIN_CITY.x}px ${ORIGIN_CITY.y}px` }}
          />

          {/* Thin outer ring */}
          <motion.circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={4.5}
            fill="#F7F6F0"
            stroke="#F26522"
            strokeWidth={1.5}
            filter="url(#originPulseGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease: 'easeOut' }}
          />

          {/* Small solid orange center */}
          <motion.circle
            cx={ORIGIN_CITY.x}
            cy={ORIGIN_CITY.y}
            r={2.6}
            fill="#F26522"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.25, ease: 'easeOut' }}
          />

          {/* Refined label VIJAYAWADA extending into open bay waters */}
          <motion.g
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
          >
            {/* Fine leader elbow line */}
            <polyline
              points={`${ORIGIN_CITY.x + 3} ${ORIGIN_CITY.y + 3} ${ORIGIN_CITY.x + 16} ${ORIGIN_CITY.y + 18} ${ORIGIN_CITY.x + 82} ${ORIGIN_CITY.y + 18}`}
              fill="none"
              stroke="#F26522"
              strokeWidth={0.8}
              strokeDasharray="2 2"
            />
            {/* Terminal tick */}
            <circle cx={ORIGIN_CITY.x + 82} cy={ORIGIN_CITY.y + 18} r={1.5} fill="#F26522" />

            {/* Label texts */}
            <text
              x={ORIGIN_CITY.x + 20}
              y={ORIGIN_CITY.y + 14}
              className="font-mono text-[8.5px] font-bold tracking-[0.16em] fill-[#171714]"
            >
              VIJAYAWADA
            </text>
            <text
              x={ORIGIN_CITY.x + 20}
              y={ORIGIN_CITY.y + 24}
              className="font-mono text-[6.5px] font-semibold tracking-[0.18em] uppercase fill-[#F26522]"
            >
              ORIGIN HUB
            </text>
          </motion.g>
        </g>
      </svg>
    </div>
  );
};
