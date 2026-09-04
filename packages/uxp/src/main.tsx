import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  intervalsAligned,
  mergeStoredLabels,
  updateIntervalLabel,
} from "./lib/annotationStore";
import {
  buildAnnotationSet,
  parseClassCsv,
  serializeToToml,
} from "./lib/annotations";
import { scanCutIntervals } from "./lib/host";
import {
  loadAnnotationSet,
  loadClassList,
  readCsvFile,
  saveAnnotationSet,
  saveClassList,
  writeTomlFile,
} from "./lib/storage";
import type { AnnotationSet, Interval } from "./shared/annotations";

const pad = (value: number, size = 2) => value.toString().padStart(size, "0");

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
  const [annotationSet, setAnnotationSetState] = useState<AnnotationSet | null>(
    null,
  );
  // Mirrors the current annotation set so handlers can build the next one
  // without a state updater, which has to stay free of side effects.
  const annotationSetRef = useRef<AnnotationSet | null>(null);
  const setAnnotationSet = useCallback((next: AnnotationSet | null) => {
    annotationSetRef.current = next;
    setAnnotationSetState(next);
  }, []);
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
      if (!result?.sequence) {
        setStatus({
          kind: "error",
          message: "No active sequence found.",
        });
        return;
      }

      const stored = await loadAnnotationSet(result.sequence);
      let intervalsNext = result.intervals;
      if (stored) {
        const aligned = intervalsAligned(intervalsNext, stored.intervals);
        if (!aligned) {
          setScanWarning(
            "Cuts changed since last scan. Labels may be misaligned.",
          );
        }
        intervalsNext = mergeStoredLabels(intervalsNext, stored.intervals);
      }

      const nextSet = buildAnnotationSet(result.sequence, intervalsNext);
      await saveAnnotationSet(nextSet);
      setAnnotationSet(nextSet);
      setStatus({ kind: "success", message: "Scan complete." });
    } catch (error) {
      const err = error as { name?: string; message?: string } | undefined;
      const parts = [err?.name, err?.message].filter((value): value is string =>
        Boolean(value),
      );
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
  }, [setAnnotationSet]);

  useEffect(() => {
    handleScan();
  }, [handleScan]);

  useEffect(() => {
    loadClassList()
      .then((storedClasses) => {
        if (storedClasses.length > 0) {
          setClassOptions(storedClasses);
        }
      })
      .catch((error) => {
        console.error("loadClassList failed:", error);
      });
  }, []);

  const handleLabelChange = useCallback(
    (id: string, value: string) => {
      const prev = annotationSetRef.current;
      if (!prev) return;

      const nextSet = {
        ...prev,
        intervals: updateIntervalLabel(prev.intervals, id, value),
        lastUpdatedAt: new Date().toISOString(),
      };
      setAnnotationSet(nextSet);
      // Writes are queued in the storage layer, so the last change requested is
      // the one that ends up on disk.
      saveAnnotationSet(nextSet).catch((error) => {
        console.error("saveAnnotationSet failed:", error);
      });
    },
    [setAnnotationSet],
  );

  const handleClearLabel = useCallback(
    (id: string) => {
      handleLabelChange(id, "");
    },
    [handleLabelChange],
  );

  const handleExport = useCallback(async () => {
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

    try {
      const filePath = await writeTomlFile(defaultName, toml);
      if (!filePath) {
        setStatus({ kind: "info", message: "Export canceled." });
        return;
      }
      setStatus({ kind: "success", message: `Exported to ${filePath}.` });
    } catch (_error) {
      setStatus({ kind: "error", message: "Export failed." });
    }
  }, [annotationSet]);

  const handleImportClasses = useCallback(async () => {
    try {
      const csvText = await readCsvFile();
      if (csvText === null) {
        setStatus({ kind: "info", message: "Class import canceled." });
        return;
      }
      const classes = parseClassCsv(csvText);
      if (!classes.length) {
        setStatus({
          kind: "error",
          message: "No classes found in CSV. Expect index,class columns.",
        });
        return;
      }
      await saveClassList(classes);
      setClassOptions(classes);
      setStatus({
        kind: "success",
        message: `Imported ${classes.length} classes.`,
      });
    } catch (_error) {
      setStatus({ kind: "error", message: "Failed to import class list." });
    }
  }, []);

  const summary = useMemo(() => {
    if (!annotationSet) return "No active sequence loaded.";
    return `${annotationSet.sequence.name} • ${intervals.length} intervals`;
  }, [annotationSet, intervals.length]);

  return (
    <div className="annotations-app">
      <div className="panel-header">
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
      </div>

      {status ? (
        <div className={`status ${status.kind}`}>{status.message}</div>
      ) : null}

      {scanWarning ? <div className="status warning">{scanWarning}</div> : null}
      {scanErrorDetail ? (
        <div className="status error">{scanErrorDetail}</div>
      ) : null}

      {classOptions.length === 0 ? (
        <div className="status warning">
          No class list loaded. Import a CSV to enable labeling.
        </div>
      ) : null}

      <div className="intervals">
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
      </div>
    </div>
  );
};
