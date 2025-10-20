import { useEffect, useMemo, useState } from "react";
import {
  Overlay,
  Modal,
  Row,
  Field,
  Footer,
  Button,
} from "../assets/styles/theme";
import {
  useGetStatusesQuery,
  useGetHealthsQuery,
  useGetOwnersQuery,
  useGetTagsQuery,
  useCreateProjectMutation,
} from "../app/api/projectApi";
import { useForm } from "react-hook-form";

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
}

type FormValues = {
  title: string;
  owner: string;
  description?: string;
  status: string;
  health: string;
  tags?: string;
};

export const AddProjectModal = ({
  isOpen,
  onClose,
  onCreated,
}: AddProjectModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createNewProject] = useCreateProjectMutation();
  const { data: statuses, isLoading: loadingStatuses } = useGetStatusesQuery();
  const { data: healths, isLoading: loadingHealths } = useGetHealthsQuery();
  const { data: owners } = useGetOwnersQuery();
  const { data: tagOptions } = useGetTagsQuery();

  const defaultValues = useMemo<FormValues>(() => {
    const status = statuses?.[0] ?? "";
    const health = healths?.[0] ?? "";
    return {
      title: "",
      owner: "",
      description: "",
      status,
      health,
      tags: "",
    };
  }, [statuses, healths]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSubmitting(false);
    reset(defaultValues);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...values,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const created = await createNewProject(payload).unwrap();

      reset(defaultValues);
      setSubmitting(false);

      onCreated?.(created);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(
        err?.data?.message || err?.message || "Failed to create project."
      );
    }
  });

  return (
    <Overlay
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-project-title"
    >
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
        <Modal>
          <h3 id="add-project-title" style={{ marginTop: 0 }}>
            Add New Project
          </h3>
          <p style={{ marginTop: 6, color: "#555" }}>
            Create a project with basic metadata. Fields marked * are required.
          </p>

          <Field>
            <label>Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="Project title"
              autoFocus
            />
            {errors.title && (
              <small style={{ color: "#b00020" }}>{errors.title.message}</small>
            )}
          </Field>

          <Field>
            <label>Owner *</label>
            <input
              {...register("owner", { required: "Owner is required" })}
              placeholder="Owner name"
              list="owner-options"
            />
            {owners?.length ? (
              <datalist id="owner-options">
                {owners.map((o: string) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            ) : null}
            {errors.owner && (
              <small style={{ color: "#b00020" }}>{errors.owner.message}</small>
            )}
          </Field>

          <Field>
            <label>Description</label>
            <textarea
              {...register("description")}
              placeholder="Short description..."
            />
          </Field>

          <Row>
            <Field>
              <label>Status</label>
              <select {...register("status")} disabled={loadingStatuses}>
                {(statuses ?? []).map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <label>Health</label>
              <select {...register("health")} disabled={loadingHealths}>
                {(healths ?? []).map((h: string) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Field>
            <label>Tags (comma separated)</label>
            <input
              {...register("tags")}
              placeholder="e.g. frontend, backend, api"
              list="tag-options"
            />
            {tagOptions?.length ? (
              <datalist id="tag-options">
                {tagOptions.map((t: string) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            ) : null}
          </Field>

          {error && (
            <div
              style={{ marginTop: 12, color: "#b00020", fontSize: "0.9rem" }}
            >
              {error}
            </div>
          )}

          <Footer>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </Footer>
        </Modal>
      </form>
    </Overlay>
  );
};

export default AddProjectModal;
