import React from 'react';

export default function SkeletonRow({ cols = 5, rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => {
            // Vary widths slightly for a more organic feel
            const widthClass = colIndex === 0 
              ? 'w-1/3' 
              : colIndex === cols - 1 
                ? 'w-1/2' 
                : 'w-3/4';
            return (
              <td key={colIndex} className="px-6 py-4">
                <div className={`h-4 bg-slate-200 rounded animate-pulse ${widthClass}`}></div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
