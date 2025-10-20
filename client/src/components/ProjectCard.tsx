import type { Project } from "../types/project";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditProjectModal } from "./EditProjectModal";
import {
  Card,
  StatusBadge,
  ViewButton,
  Health,
  TagsContainer,
  ProgressBar,
  Tag,
} from "../assets/styles/theme";

export const ProjectCard = ({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected?: boolean;
  onSelect?: (id: string | number, checked: boolean) => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const formattedDate = new Date(project.last_updated).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Normalize tags (array or string)
  const tagList: string[] = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === "string"
    ? (project.tags as string).split(",").map((t) => t.trim())
    : [];

  return (
    <>
      <Card
        selected={selected}
        onClick={() => onSelect?.(project.id, !selected)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {project.title}
              </h1>
              <StatusBadge $status={String(project.status)}>
                {project.status}
              </StatusBadge>
            </div>

            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(project.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {project.description && (
            <p style={{ marginTop: 4, marginBottom: 0, color: "#555" }}>
              <i>{project.description}</i>
            </p>
          )}
          <small style={{ margin: "2px 0" }}>
            Owned by <b>{project.owner}</b>
          </small>
        </div>

        <div style={{ margin: "14px 0 8px" }}>
          <small style={{ margin: 0 }}>Progress: {project.progress}%</small>
          <ProgressBar $value={Number(project.progress) || 0} />
        </div>

        <div style={{ margin: "6px 0" }}>
          <TagsContainer>
            {tagList.length > 0 ? (
              tagList.map((t) => <Tag key={t}>{t}</Tag>)
            ) : (
              <Tag>—</Tag>
            )}
          </TagsContainer>
        </div>

        <small style={{ margin: "6px 0" }}>
          Health:
          <Health $level={String(project.health)}>{project.health}</Health>
        </small>
        <br />
        <ViewButton
          aria-label={`View details for ${project.title}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project.id}`);
          }}
        >
          View Details
        </ViewButton>

        <br />
        <small style={{ color: "#777" }}>Last update: {formattedDate}</small>
      </Card>

      <EditProjectModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onUpdated={() => {}}
      />
    </>
  );
};
