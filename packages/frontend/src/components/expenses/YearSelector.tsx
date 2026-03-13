interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(year - 1)}
        className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span className="text-xl font-bold text-gray-900 min-w-[4rem] text-center">
        {year}
      </span>
      <button
        onClick={() => onChange(year + 1)}
        className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
