"use client";

import React from "react";

interface TallyMarksProps {
  count: number;
  className?: string;
  color?: string;
}

export function TallyMarks({ count, className = "", color = "currentColor" }: TallyMarksProps) {
  if (count <= 0) {
    return <span className="text-xs text-neutral-500 italic font-mono-receipt">0 orders</span>;
  }

  const fullGroups = Math.floor(count / 5);
  const remainder = count % 5;

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`} title={`${count} orders logged`}>
      {Array.from({ length: fullGroups }).map((_, groupIdx) => (
        <svg
          key={`full-${groupIdx}`}
          className="w-6 h-5 flex-shrink-0"
          viewBox="0 0 28 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {/* 4 vertical tally strokes */}
          <line x1="4" y1="4" x2="4" y2="20" />
          <line x1="10" y1="4" x2="10" y2="20" />
          <line x1="16" y1="4" x2="16" y2="20" />
          <line x1="22" y1="4" x2="22" y2="20" />
          {/* 1 diagonal strike-through */}
          <line x1="2" y1="19" x2="24" y2="5" stroke="#C1432E" strokeWidth="2.8" />
        </svg>
      ))}

      {remainder > 0 && (
        <svg
          className="h-5 flex-shrink-0"
          style={{ width: `${remainder * 6 + 4}px` }}
          viewBox={`0 0 ${remainder * 6 + 4} 24`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {Array.from({ length: remainder }).map((_, rIdx) => (
            <line
              key={`rem-${rIdx}`}
              x1={4 + rIdx * 6}
              y1="4"
              x2={4 + rIdx * 6}
              y2="20"
            />
          ))}
        </svg>
      )}
    </div>
  );
}
