import { useState } from "react";
import { Button } from "../ui/Button";
import { exportExpensesCSV } from "../../api/expenses.api";

interface ExportButtonProps {
  year: number;
  disabled?: boolean;
}

export function ExportButton({ year, disabled }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportExpensesCSV(year);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={disabled || exporting}
    >
      <svg
        className="w-4 h-4 mr-1.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {exporting ? "Exporting..." : "CSV"}
    </Button>
  );
}
