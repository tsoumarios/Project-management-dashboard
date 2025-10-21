import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
} from "../app/api/projectApi";
import { EditProjectModal } from "../components/EditProjectModal";
import { useState } from "react";
import {
  Card,
  BackButton,
  Tag,
  ProgressBar,
  Health,
  StatusBadge,
  EditButton,
  DangerButton,
} from "../assets/styles/theme";

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const {
    data: project,
    isLoading,
    error,
  } = useGetProjectByIdQuery(Number(id), { skip: false });

  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <p>Loading project...</p>;
  if (error) return <p>Error loading project details.</p>;
  if (!project) return <p>Project not found.</p>;

  const isDeleted = Boolean(project.is_deleted);
  const formattedDate = new Date(project.last_updated).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tagList: string[] = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === "string"
    ? (project.tags as string).split(",").map((t) => t.trim())
    : [];
  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = window.confirm(`Delete project “${project.title}”?`);
    if (!ok) return;
    try {
      await deleteProject(Number(project.id)).unwrap(); // calls soft delete
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    }
  };
  return (
    <div>
      <BackButton onClick={() => navigate("/")}>← Back to Projects</BackButton>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {/* Title + Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h2 style={{ marginBottom: 0, marginTop: 0 }}>{project.title}</h2>
              <StatusBadge $status={String(project.status)}>
                {project.status}
              </StatusBadge>
            </div>

            <p style={{ color: "#555", marginTop: 4 }}>
              Owned by <b>{project.owner}</b>
            </p>
          </div>
          {/* actions */}
          {!isDeleted && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <EditButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
              >
                Edit project
              </EditButton>

              <DangerButton onClick={onDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </DangerButton>
            </div>
          )}
        </div>

        {project.description && (
          <div style={{ marginTop: 16 }}>
            <p style={{ margin: 0 }}>Description:</p>
            <p style={{ marginTop: 6, color: "#444" }}>{project.description}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>Progress: {project.progress}%</p>
          <ProgressBar $value={Number(project.progress) || 0} />
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>
            Health:{" "}
            <Health $level={String(project.health)}>{project.health}</Health>
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>Tags:</p>
          <div style={{ marginTop: 4 }}>
            {tagList.length > 0 ? (
              tagList.map((t) => <Tag key={t}>{t}</Tag>)
            ) : (
              <Tag>—</Tag>
            )}
          </div>
        </div>

        <small style={{ display: "block", marginTop: 20, color: "#777" }}>
          Last update: {formattedDate}
        </small>
      </Card>
      <EditProjectModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onUpdated={() => {}}
      />
    </div>
  );
};
