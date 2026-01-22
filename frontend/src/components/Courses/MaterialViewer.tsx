import type { Material } from "../../types/course";

interface MaterialViewerProps {
  material: Material;
}

export default function MaterialViewer({ material }: MaterialViewerProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{material.title}</h3>

        {/* Download */}
        {material.downloadUrl && (
          <a
            href={material.downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            ⬇ Download
          </a>
        )}
      </div>

      {/* =========================
          Material rendering
         ========================= */}

      {/* VIDEO */}
      {material.materialType === "VIDEO" && material.downloadUrl && (
        <video
          controls
          className="w-full max-h-[75vh] rounded border"
          src={material.downloadUrl}
        />
      )}

      {/* PDF */}
      {material.materialType === "PDF" && material.downloadUrl && (
        <iframe
          src={material.downloadUrl}
          className="w-full h-[80vh] rounded border"
          title={material.title}
        />
      )}

      {/* SLIDES */}
      {material.materialType === "SLIDE" && material.downloadUrl && (
        <iframe
          src={material.downloadUrl}
          className="w-full h-[80vh] rounded border"
          title={material.title}
        />
      )}

      {/* TEXT */}
      {material.materialType === "TEXT" && (
        <article className="prose max-w-none">
          {/* If later you add text content */}
          <p>Text material rendering coming soon.</p>
        </article>
      )}
    </div>
  );
}
