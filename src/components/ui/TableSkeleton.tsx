export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number, cols?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-gray-100 dark:border-gray-800 p-4 gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`h-4 bg-gray-200 dark:bg-gray-800 rounded ${
                colIndex === 0 ? 'w-1/4' : 
                colIndex === cols - 1 ? 'w-1/6 ml-auto' : 'w-1/5'
              }`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
