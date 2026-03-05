import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildAnnotationSet,
  loadAnnotationSet,
  loadClassList,
  parseClassCsv,
  promptCsvPath,
  promptSavePath,
  readCsvFile,
  saveAnnotationSet,
  saveClassList,
  scanCutIntervals,
  serializeToToml,
  writeTomlFile,
} from "../lib/annotations";
import {
  intervalsAligned,
  mergeStoredLabels,
  updateIntervalLabel,
} from "./annotationStore";
import type { AnnotationSet, Interval } from "../../shared/annotations";
import "./main.scss";

const pad = (value: number, size = 2) =>
  value.toString().padStart(size, "0");

const formatTimecode = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "--:--:--.---";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const wholeSeconds = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(wholeSeconds)}.${pad(millis, 3)}`;
};

type StatusKind = "info" | "success" | "error";

type Status = {
  kind: StatusKind;
  message: string;
};

type IntervalRowProps = {
  interval: Interval;
  classOptions: string[];
  onLabelChange: (id: string, value: string) => void;
  onClear: (id: string) => void;
};

const IntervalRow = ({
  interval,
  classOptions,
  onLabelChange,
  onClear,
}: IntervalRowProps) => {
  return (
    <div
      className={`interval-row ${
        interval.label && interval.label.trim().length > 0 ? "" : "unlabeled"
      }`}
    >
      <div className="interval-time">
        <div className="timecode">{formatTimecode(interval.startSeconds)}</div>
        <div className="timecode">{formatTimecode(interval.endSeconds)}</div>
      </div>
      <div className="interval-label">
        <select
          value={interval.label ?? ""}
          onChange={(event) => onLabelChange(interval.id, event.target.value)}
        >
          <option value="">Unlabeled</option>
          {classOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="clear-button"
          onClick={() => onClear(interval.id)}
          title="Clear label"
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

const MemoIntervalRow = memo(IntervalRow);

export const App = () => {
  const [annotationSet, setAnnotationSet] = useState<AnnotationSet | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanWarning, setScanWarning] = useState<string | null>(null);
  const [scanErrorDetail, setScanErrorDetail] = useState<string | null>(null);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  const intervals = annotationSet?.intervals ?? [];

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setStatus({ kind: "info", message: "Scanning timeline cuts..." });
    setScanWarning(null);
    setScanErrorDetail(null);

    try {
      const result = await scanCutIntervals();
      if (!result || !result.sequence) {
        setStatus({
          kind: "error",
          message: "No active sequence found.",
        });
        setIsScanning(false);
        return;
      }

      const stored = loadAnnotationSet(result.sequence);
      let intervalsNext = result.intervals as Interval[];
      if (stored) {
        const aligned = intervalsAligned(intervalsNext, stored.intervals);
        if (!aligned) {
          setScanWarning(
            "Cuts changed since last scan. Labels may be misaligned."
          );
        }
        intervalsNext = mergeStoredLabels(intervalsNext, stored.intervals);
      }

      const nextSet = buildAnnotationSet(result.sequence, intervalsNext);
      saveAnnotationSet(nextSet);
      setAnnotationSet(nextSet);
      setStatus({ kind: "success", message: "Scan complete." });
    } catch (error) {
      const err = error as
        | { name?: string; message?: string; fileName?: string; line?: number }
        | undefined;
      const parts = [
        err?.name,
        err?.message,
        err?.fileName,
        typeof err?.line === "number" ? `line:${err.line}` : undefined,
      ].filter((value): value is string => Boolean(value));
      const detail = parts.length > 0 ? parts.join(" | ") : String(error);
      setScanErrorDetail(detail);
      console.error("scanCutIntervals failed:", error);
      setStatus({
        kind: "error",
        message: "Scan failed. Check the console for details.",
      });
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!window.cep) return;
    handleScan();
  }, [handleScan]);

  useEffect(() => {
    if (!window.cep) return;
    const storedClasses = loadClassList();
    if (storedClasses.length > 0) {
      setClassOptions(storedClasses);
    }
  }, []);

  const handleLabelChange = useCallback((id: string, value: string) => {
    setAnnotationSet((prev) => {
      if (!prev) return prev;
      const updatedIntervals = updateIntervalLabel(prev.intervals, id, value);
      const nextSet = {
        ...prev,
        intervals: updatedIntervals,
        lastUpdatedAt: new Date().toISOString(),
      };
      saveAnnotationSet(nextSet);
      return nextSet;
    });
  }, []);

  const handleClearLabel = useCallback((id: string) => {
    handleLabelChange(id, "");
  }, [handleLabelChange]);

  const handleExport = useCallback(() => {
    if (!annotationSet) {
      setStatus({ kind: "error", message: "No annotations to export." });
      return;
    }

    const exportFile = {
      sequence: annotationSet.sequence,
      exportedAt: new Date().toISOString(),
      intervals: annotationSet.intervals,
    };

    const toml = serializeToToml(exportFile);
    const defaultName = `${annotationSet.sequence.name || "annotations"}.toml`;
    const filePath = promptSavePath(defaultName);

    if (!filePath) {
      setStatus({ kind: "info", message: "Export canceled." });
      return;
    }

    try {
      writeTomlFile(filePath, toml);
      setStatus({ kind: "success", message: `Exported to ${filePath}.` });
    } catch (error) {
      setStatus({ kind: "error", message: "Export failed." });
    }
  }, [annotationSet]);

  const handleImportClasses = useCallback(() => {
    const csvPath = promptCsvPath();
    if (!csvPath) {
      setStatus({ kind: "info", message: "Class import canceled." });
      return;
    }
    try {
      const csvText = readCsvFile(csvPath);
      const classes = parseClassCsv(csvText);
      if (!classes.length) {
        setStatus({
          kind: "error",
          message: "No classes found in CSV. Expect index,class columns.",
        });
        return;
      }
      saveClassList(classes);
      setClassOptions(classes);
      setStatus({
        kind: "success",
        message: `Imported ${classes.length} classes.`,
      });
    } catch (error) {
      setStatus({ kind: "error", message: "Failed to import class list." });
    }
  }, []);

  const summary = useMemo(() => {
    if (!annotationSet) return "No active sequence loaded.";
    return `${annotationSet.sequence.name} • ${intervals.length} intervals`;
  }, [annotationSet, intervals.length]);

  return (
    <div className="annotations-app">
      <header className="panel-header">
        <div>
          <h1>Premiere Cut Annotations</h1>
          <p className="subtitle">{summary}</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={handleScan} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Scan Cuts"}
          </button>
          <button type="button" onClick={handleImportClasses}>
            Import Classes
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!annotationSet}
          >
            Export TOML
          </button>
        </div>
      </header>

      {status ? (
        <div className={`status ${status.kind}`}>{status.message}</div>
      ) : null}

      {scanWarning ? (
        <div className="status warning">{scanWarning}</div>
      ) : null}
      {scanErrorDetail ? (
        <div className="status error">{scanErrorDetail}</div>
      ) : null}

      {classOptions.length === 0 ? (
        <div className="status warning">
          No class list loaded. Import a CSV to enable labeling.
        </div>
      ) : null}

      <section className="intervals">
        <div className="intervals-header">
          <span>Intervals</span>
          <span className="hint">
            Labels come from the class list CSV. Unlabeled is allowed.
          </span>
        </div>
        <div className="intervals-list">
          {intervals.length === 0 ? (
            <div className="empty-state">No intervals yet. Run a scan.</div>
          ) : (
            intervals.map((interval) => (
              <MemoIntervalRow
                key={interval.id}
                interval={interval}
                classOptions={classOptions}
                onLabelChange={handleLabelChange}
                onClear={handleClearLabel}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};
