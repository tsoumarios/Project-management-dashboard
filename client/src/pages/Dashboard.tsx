import { useEffect, useMemo, useState } from "react";
import { useGetProjectsQuery } from "../app/api/projectApi";
import { useRealtime } from "../hooks/useRealtime";
import { FiltersBar } from "../components/FiltersBar";
import { Button } from "../assets/styles/theme";
import { ProjectCard } from "../components/ProjectCard";
import { BulkUpdateModal } from "../components/BulkUpdateModal";
import { useBulkUpdateProjectsMutation } from "../app/api/projectApi";
import { AddProjectModal } from "../components/AddProjectModal";
import { Grid, Pager, PageInfo } from "../assets/styles/theme";

const PAGE_SIZE = 9;

export const Dashboard = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<string>("-last_updated"); // default: newest first
  useEffect(() => {
    setPage(1);
  }, [filters, ordering]); // reset page when sort changes

  const queryParams = useMemo(() => {
    const offset = (page - 1) * PAGE_SIZE;
    // include ordering only if set
    return {
      limit: PAGE_SIZE,
      offset,
      ...(ordering ? { ordering } : {}),
      ...filters,
      is_deleted: "false",
    };
  }, [page, filters, ordering]);

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsQuery(queryParams);
  useRealtime(refetch);

  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkUpdate, { isLoading: bulkLoading }] =
    useBulkUpdateProjectsMutation();

  const toggleSelect = (id: string | number, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleBulkUpdate = async (update: {
    status?: string;
    tag?: string;
  }) => {
    try {
      await bulkUpdate({
        ids: selected.map(Number),
        status: update.status || undefined,
        tag: update.tag || undefined,
      }).unwrap();
      setIsBulkOpen(false);
      setSelected([]);
      refetch();
    } catch (e) {
      console.error("Bulk update failed:", e);
    }
  };

  const total = projects?.count ?? 0;
  const items = projects?.results ?? [];
  const start = total === 0 ? 0 : (queryParams.offset ?? 0) + 1;
  const end = Math.min((queryParams.offset ?? 0) + items.length, total);
  const canPrev = page > 1;
  const canNext = end < total;

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <h2>Projects</h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <FiltersBar filters={filters} onChange={setFilters} />
        {/* Sort control */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.75, width: "55px" }}>
            Sort by:
          </span>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          >
            {/* last updated */}
            <option value="-last_updated">Last updated ↓</option>
            <option value="last_updated">Last updated ↑</option>
            {/* title */}
            <option value="title">Title A–Z</option>
            <option value="-title">Title Z–A</option>
            {/* owner */}
            <option value="owner">Owner A–Z</option>
            <option value="-owner">Owner Z–A</option>
            {/* progress */}
            <option value="-progress">Progress high → low</option>
            <option value="progress">Progress low → high</option>
            {/* status */}
            <option value="status">Status A–Z</option>
            <option value="-status">Status Z–A</option>
            {/* health */}
            <option value="health">Health A–Z</option>
            <option value="-health">Health Z–A</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <Button onClick={() => setIsAddOpen(true)}>New Project</Button>
        <Button
          onClick={() => setIsBulkOpen(true)}
          disabled={selected.length === 0 || bulkLoading}
        >
          {bulkLoading ? "Updating..." : `Bulk Update (${selected.length})`}
        </Button>
        {selected.length > 0 && (
          <Button variant="outline" onClick={() => setSelected([])}>
            Clear Selection
          </Button>
        )}
      </div>

      <Grid>
        {items.map((p: any) => (
          <ProjectCard
            key={p.id}
            project={p}
            selected={selected.includes(p.id)}
            onSelect={toggleSelect}
          />
        ))}
      </Grid>

      <Pager>
        <PageInfo>
          {total > 0 ? `${start}-${end} of ${total}` : "0 results"}
        </PageInfo>
        <Button
          variant="outline"
          onClick={() => canPrev && setPage((p) => p - 1)}
          disabled={!canPrev}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          onClick={() => canNext && setPage((p) => p + 1)}
          disabled={!canNext}
        >
          Next
        </Button>
      </Pager>

      <BulkUpdateModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onConfirm={handleBulkUpdate}
      />
      <AddProjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={refetch}
      />
    </>
  );
};
