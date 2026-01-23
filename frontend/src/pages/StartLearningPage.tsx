import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAppSelector } from "../store/hooks";

import MaterialFormModal from "../components/Courses/MaterialFormModal";
import ConfirmDangerModal from "../components/Courses/ConfirmingDangerModal";

import {
  getLecturesByCourseId,
  getMaterialsByLectureId,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../services/course.service";


import type { Lecture, Material } from "../types/course";

export default function StartLearningPage() {
  const location = useLocation();
  const initialLectureId =
    (location.state as { lectureId?: string })?.lectureId;
  console.log("incoming lectureId:", initialLectureId);

  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [materialsMap, setMaterialsMap] = useState<Record<string, Material[]>>(
    {}
  );

  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  // Admin state
  const [creatingLectureId, setCreatingLectureId] = useState<string | null>(null);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [openMenuMaterialId, setOpenMenuMaterialId] = useState<string | null>(
    null
  );

  const resetMaterialModalState = () => {
    setCreatingLectureId(null);
    setEditingLectureId(null);
    setEditingMaterial(null);
    setDeletingMaterial(null);
  };


  useEffect(() => {
    if (!courseId) return;
    getLecturesByCourseId(courseId).then(setLectures);
  }, [courseId]);

  useEffect(() => {
    if (!initialLectureId) return;
    if (lectures.length === 0) return;

    const lecture = lectures.find(
      (l) => l.lectureId === initialLectureId
    );

    if (!lecture) return;

    // 1️⃣ Expand the lecture
    setExpandedLectureId(lecture.lectureId);

    // 2️⃣ Load materials if not already loaded
    if (!materialsMap[lecture.lectureId]) {
      getMaterialsByLectureId(courseId!, lecture.lectureId).then(
        (materials) => {
          setMaterialsMap((prev) => ({
            ...prev,
            [lecture.lectureId]: materials,
          }));

          // 3️⃣ Auto-select first material
          if (materials.length > 0) {
            setActiveMaterial(materials[0]);
          }
        }
      );
    }
  }, [initialLectureId, lectures]);


  /* =========================
     Toggle lecture accordion
     ========================= */
  const toggleLecture = async (lecture: Lecture) => {
    const isOpen = expandedLectureId === lecture.lectureId;

    if (isOpen) {
      setExpandedLectureId(null);
      return;
    }

    setExpandedLectureId(lecture.lectureId);

    if (!materialsMap[lecture.lectureId]) {
      const materials = await getMaterialsByLectureId(
        courseId!,
        lecture.lectureId
      );

      setMaterialsMap((prev) => ({
        ...prev,
        [lecture.lectureId]: materials,
      }));

      if (materials.length && !activeMaterial) {
        setActiveMaterial(materials[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-[calc(100vh-64px)]">
        {/* =========================
            SIDEBAR
           ========================= */}
        <aside
          className="w-80 bg-gradient-to-b from-indigo-50 via-white to-white border-r overflow-y-auto"
          onClick={() => setOpenMenuMaterialId(null)}
        >
          <div className="px-5 py-4 text-xl font-semibold uppercase tracking-wider text-indigo-600">
            Course content
          </div>

          <div className="space-y-4 px-3 pb-8">
            {lectures.map((lecture, index) => {
              const isOpen = expandedLectureId === lecture.lectureId;

              return (
                <div
                  key={lecture.lectureId}
                  className={`rounded-xl transition ${isOpen
                    ? "bg-white shadow-sm border border-indigo-100"
                    : "hover:bg-indigo-50/80"
                    }`}
                >
                  <button
                    onClick={() => toggleLecture(lecture)}
                    className="w-full px-4 pt-4 pb-2 flex items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        Lecture {index + 1}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {lecture.title}
                      </p>
                    </div>

                    <span
                      className={`text-lg font-bold ${isOpen ? "text-indigo-600" : "text-slate-400"
                        }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pb-3 mt-2 space-y-1">
                      {materialsMap[lecture.lectureId]?.map((material) => {
                        const isActive =
                          activeMaterial?.materialId === material.materialId;

                        return (
                          <div
                            key={material.materialId}
                            className={`group flex items-center gap-3 px-4 py-2 ml-2 mr-2 rounded-lg text-sm transition ${isActive
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                              : "text-slate-600 hover:bg-indigo-100/60"
                              }`}
                          >
                            <span
                              className={`w-1 h-6 rounded-full ${isActive ? "bg-white" : "bg-indigo-300/40"
                                }`}
                            />

                            <button
                              onClick={() => setActiveMaterial(material)}
                              className="flex-1 text-left truncate"
                            >
                              {material.title}
                            </button>
                          </div>
                        );
                      })}

                      {isAdmin && (
                        <button
                          onClick={() =>
                            setCreatingLectureId(lecture.lectureId)
                          }
                          className="ml-6 mt-1 text-xs text-indigo-600 hover:underline"
                        >
                          + Add material
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* =========================
            VIEWER
           ========================= */}
        <main className="flex-1 bg-white flex flex-col">
          {/* ===== ALWAYS VISIBLE TOP BAR ===== */}
          <div className="h-12 px-6 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
            <button
              onClick={() => navigate(`/courses/${courseId}/dashboard`)}
              className="hover:underline"
            >
              ← Back to course
            </button>

            <button
              className="btn btn-xs bg-black/20 text-white border border-white/30 rounded-full px-4"
            >
              🤖 AI Summary
            </button>
          </div>

          {/* ===== CONTENT AREA ===== */}
          <div className="flex-1 overflow-hidden">
            {!activeMaterial ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  Select a material to start learning
                </span>
              </div>
            ) : (
              <>
                {activeMaterial.mimeType?.includes("pdf") && (
                  <iframe
                    src={activeMaterial.downloadUrl}
                    className="w-full h-full"
                  />
                )}

                {activeMaterial.mimeType?.includes("video") && (
                  <video
                    controls
                    src={activeMaterial.downloadUrl}
                    className="w-full h-full object-contain"
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* =========================
          MODALS (unchanged)
         ========================= */}
      {(creatingLectureId || editingMaterial) && (
        <MaterialFormModal
          open
          initialData={editingMaterial ?? undefined}
          onClose={resetMaterialModalState}
          onSubmit={async (formData) => {
            if (editingMaterial && editingLectureId) {
              await updateMaterial(
                courseId!,
                editingLectureId,
                editingMaterial.materialId,
                formData
              );
            }

            if (creatingLectureId) {
              await createMaterial(courseId!, creatingLectureId, formData);
            }

            const lectureId = editingLectureId ?? creatingLectureId!;
            const fresh = await getMaterialsByLectureId(courseId!, lectureId);

            setMaterialsMap((prev) => ({
              ...prev,
              [lectureId]: fresh,
            }));

            setActiveMaterial(fresh[fresh.length - 1] ?? null);
            resetMaterialModalState();
          }}
        />
      )}

      {deletingMaterial && editingLectureId && (
        <ConfirmDangerModal
          open
          title="Delete material"
          description={`Delete "${deletingMaterial.title}"?`}
          confirmText="Delete"
          onClose={resetMaterialModalState}
          onConfirm={async () => {
            await deleteMaterial(
              courseId!,
              editingLectureId,
              deletingMaterial.materialId
            );

            const fresh = await getMaterialsByLectureId(
              courseId!,
              editingLectureId
            );

            setMaterialsMap((prev) => ({
              ...prev,
              [editingLectureId]: fresh,
            }));

            setActiveMaterial(fresh[0] ?? null);
            resetMaterialModalState();
          }}
        />
      )}
    </div>
  );
}
