import { useEffect, useState } from "react";
import { Overlay, Modal, Row, Field, Button } from "../assets/styles/theme";
import {
  useUpdateProjectMutation,
  useGetStatusesQuery,
  useGetHealthsQuery,
} from "../app/api/projectApi";
import type { Project } from "../types/project";

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdated?: (p: Project) => void;
}) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [health, setHealth] = useState("");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  const { data: statuses = [] } = useGetStatusesQuery();
  const { data: healths = [] } = useGetHealthsQuery();

  useEffect(() => {
    if (!isOpen || !project) return;
    setTitle(project.title ?? "");
    setOwner(project.owner ?? "");
    setDescription(project.description ?? "");
    setStatus(project.status ?? "");
    setHealth(String(project.health ?? ""));
    setTags(
      Array.isArray(project.tags)
        ? project.tags.join(", ")
        : (project.tags as any) ?? ""
    );
    setProgress(Number(project.progress ?? 0));
    setError(null);
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const parseTags = (s: string) =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    setError(null);
    try {
      const body: Partial<Project> = {
        title: title.trim(),
        owner: owner.trim(),
        description: description.trim(),
        status,
        health,
        progress: Math.max(0, Math.min(100, Number(progress) || 0)),
        tags: parseTags(tags),
      };

      const updated = await updateProject({
        id: Number(project.id),
        body,
        version: project.version,
      }).unwrap();

      onUpdated?.(updated);
      onClose();
    } catch (e: any) {
      if (e?.status === 409) {
        setError("This project was modified elsewhere. Reload and try again.");
      } else if (e?.data) {
        setError(typeof e.data === "string" ? e.data : JSON.stringify(e.data));
      } else {
        setError("Failed to update project.");
      }
    }
  };

  return (
    <Overlay onClick={(e) => e.currentTarget === e.target && onClose()}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Edit Project</h3>

        <Field>
          <label>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <Row>
          <Field>
            <label>Owner *</label>
            <input value={owner} onChange={(e) => setOwner(e.target.value)} />
          </Field>
          <Field>
            <label>Progress (0–100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </Field>
        </Row>

        <Field>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Row>
          <Field>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <label>Health</label>
            <select value={health} onChange={(e) => setHealth(e.target.value)}>
              {healths.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </Field>
        </Row>

        <Field>
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>

        {error && (
          <div style={{ marginTop: 12, color: "#b00020" }}>{error}</div>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Modal>
    </Overlay>
  );
}
