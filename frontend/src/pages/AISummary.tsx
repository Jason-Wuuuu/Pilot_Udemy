import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { aiGenerateSummaryPreview } from "../services/course.service";
import MarkdownRenderer from "../components/MarkdownRenderer";

type Props = {
  open: boolean;
  onClose: () => void;
  downloadUrl?: string;
  mimeType?: string;
  materialTitle?: string;
};

export default function AISummaryModal({
  open,
  onClose,
  downloadUrl,
  mimeType,
  materialTitle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  if (!open) return null;

  const handleGenerate = async () => {
    if (!downloadUrl) {
      toast.error("No material selected");
      return;
    }

    if (mimeType !== "application/pdf") {
      toast.error("Only PDF is supported");
      return;
    }

    try {
      setLoading(true);
      setSummary("");
      const res = await aiGenerateSummaryPreview({ downloadUrl, mimeType });
      
      setSummary(res.summary);
    } catch {
      toast.error("AI summary failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) setSummary("");
  }, [open, downloadUrl]);

  return (
    <dialog className="modal modal-open">
      {/* backdrop blur */}
      <div className="modal-box max-w-5xl relative overflow-hidden rounded-2xl">
        {/* gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow">
                  ✨
                </span>
                AI Summary
              </h3>
              <p className="text-sm text-gray-500">
                Smart overview generated from your material
              </p>
            </div>

            <button
              className="btn btn-sm btn-ghost rounded-full"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Material chip */}
          {materialTitle && (
            <div className="inline-flex items-center gap-2 rounded-full bg-base-200/70 px-4 py-1 text-sm backdrop-blur">
              <span className="text-gray-500">Material</span>
              <span className="font-medium">PDF</span>
            </div>
          )}

          {/* AI Output Card */}
          <div className="rounded-2xl bg-base-100/70 backdrop-blur p-6 min-h-[280px] max-h-[60vh] shadow-lg overflow-y-auto">
            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-gradient-to-r from-base-300 via-base-200 to-base-300" />
                <div className="h-4 w-full rounded bg-base-300" />
                <div className="h-4 w-5/6 rounded bg-base-300" />
                <div className="h-4 w-2/3 rounded bg-base-300" />
              </div>
            )}

            {!loading && !summary && (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Click “Generate” to let AI summarize this material
              </div>
            )}

            {!loading && summary && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                <MarkdownRenderer content={summary}/>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary shadow-md"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "✨ Generate Summary"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
