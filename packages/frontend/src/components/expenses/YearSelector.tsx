import { useState } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import {
  rangeDays,
  shiftDate,
  yearRange,
  type DateRange,
} from "../../utils/dateRange";

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
}
export function YearSelector({ range, onChange }: Props) {
  const [mode, setMode] = useState<"year" | "custom">("year");
  const [draft, setDraft] = useState(range);
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState("");
  const year = Number(range.startDate.slice(0, 4));
  const days = rangeDays(range);
  function selectMode(next: "year" | "custom") {
    setMode(next);
    setError("");
    if (next === "year") onChange(yearRange(year));
    else {
      const value = {
        startDate: range.startDate,
        endDate: shiftDate(range.startDate, 364),
      };
      setDraft(value);
      setLocked(true);
      onChange(value);
    }
  }
  function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.startDate || !draft.endDate || draft.startDate > draft.endDate) {
      setError("Choose an end date on or after the start date.");
      return;
    }
    onChange(draft);
    setError("");
  }
  return (
    <section className="period-panel" aria-label="Expense period">
      <div className="period-top">
        <div className="section-label">
          <CalendarBlank size={20} /> Expense period
        </div>
        <div className="segmented" aria-label="Period mode">
          <button
            type="button"
            aria-pressed={mode === "year"}
            onClick={() => selectMode("year")}
          >
            Year
          </button>
          <button
            type="button"
            aria-pressed={mode === "custom"}
            onClick={() => selectMode("custom")}
          >
            Custom dates
          </button>
        </div>
      </div>
      {mode === "year" ? (
        <div className="year-navigation">
          <button
            type="button"
            aria-label="Previous year"
            disabled={year <= 1}
            onClick={() => onChange(yearRange(year - 1))}
          >
            <CaretLeft size={20} />
          </button>
          <div>
            <strong>{year}</strong>
            <span>January 1 to December 31</span>
          </div>
          <button
            type="button"
            aria-label="Next year"
            disabled={year >= 9999}
            onClick={() => onChange(yearRange(year + 1))}
          >
            <CaretRight size={20} />
          </button>
        </div>
      ) : (
        <form onSubmit={apply} className="period-form">
          <div className="date-fields">
            <Input
              label="From"
              id="periodStart"
              type="date"
              min="0001-01-01"
              max="9998-12-31"
              required
              value={draft.startDate}
              onChange={(e) => {
                const startDate = e.target.value;
                setDraft({
                  startDate,
                  endDate:
                    locked && startDate
                      ? shiftDate(startDate, 364)
                      : draft.endDate,
                });
              }}
            />
            <Input
              label="To (inclusive)"
              id="periodEnd"
              type="date"
              min={draft.startDate}
              max="9999-12-31"
              required
              value={draft.endDate}
              onChange={(e) => {
                const endDate = e.target.value;
                setDraft({
                  startDate:
                    locked && endDate
                      ? shiftDate(endDate, -364)
                      : draft.startDate,
                  endDate,
                });
              }}
            />
          </div>
          <div className="period-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => {
                  setLocked(e.target.checked);
                  if (e.target.checked && draft.startDate)
                    setDraft({
                      ...draft,
                      endDate: shiftDate(draft.startDate, 364),
                    });
                }}
              />{" "}
              Keep a 365-day window
            </label>
            <Button type="submit" size="sm">
              Apply dates
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <p className="period-caption">
            Showing {range.startDate} to {range.endDate} · {days} days,
            including both dates
          </p>
        </form>
      )}
    </section>
  );
}
