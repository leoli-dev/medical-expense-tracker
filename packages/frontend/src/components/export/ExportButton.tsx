import { DownloadSimple } from "@phosphor-icons/react";
import type { DateRange } from "../../utils/dateRange";
import { useState } from "react";
import { Button } from "../ui/Button";
import { exportExpensesCSV } from "../../api/expenses.api";

interface ExportButtonProps {
  range: DateRange;
  disabled?: boolean;
}

export function ExportButton({ range, disabled }: ExportButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await exportExpensesCSV(range);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed. Try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-action">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={disabled || exporting}
      >
        <DownloadSimple size={18} className="mr-2" />
        {exporting ? "Exporting..." : "Export CSV"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
