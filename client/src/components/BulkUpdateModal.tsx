import { useState, useEffect } from "react";
import { Overlay, Modal, Button } from "../assets/styles/theme";
import { useGetStatusesQuery, useGetTagsQuery } from "../app/api/projectApi";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (update: { status?: string; tag?: string }) => void;
}

export const BulkUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
}: BulkUpdateModalProps) => {
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");

  // Fetch dynamic data
  const { data: statuses = [], isLoading: loadingStatuses } =
    useGetStatusesQuery(undefined, {
      skip: !isOpen,
      refetchOnMountOrArgChange: true,
    });
  const { data: tags = [], isLoading: loadingTags } = useGetTagsQuery(
    undefined,
    { skip: !isOpen, refetchOnMountOrArgChange: true }
  );

  // Reset values when reopened
  useEffect(() => {
    if (isOpen) {
      setStatus("");
      setTag("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ status, tag });
    setStatus("");
    setTag("");
  };

  const loading = loadingStatuses || loadingTags;

  return (
    <Overlay>
      <Modal>
        <h3>Bulk Update</h3>
        <small>Update status or add a tag to selected projects.</small>

        {/* STATUS SELECT */}
        <div style={{ marginTop: 12 }}>
          <label>Status: </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loadingStatuses}
          >
            <option value="">No change</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* TAG INPUT with suggestions */}
        <div style={{ marginTop: 12 }}>
          <label>Add tag: </label>
          <input
            type="text"
            placeholder="Add or select a tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            list="tag-options"
          />
          {tags.length > 0 && (
            <datalist id="tag-options">
              {tags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            Apply
          </Button>
        </div>
      </Modal>
    </Overlay>
  );
};
