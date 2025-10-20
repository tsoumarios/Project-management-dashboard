import { useEffect, useMemo, useState } from "react";
import {
  useGetDeletedProjectsQuery,
  useBulkRecoverProjectsMutation,
} from "../app/api/projectApi";
import { Button, Bar, Grid } from "../assets/styles/theme";
import { ProjectCard } from "../components/ProjectCard";

const PAGE_SIZE = 9;

export const DeletedProjects = () => {
  const [page, setPage] = useState(1);
  const query = useMemo(() => {
    const offset = (page - 1) * PAGE_SIZE;
    return { limit: PAGE_SIZE, offset };
  }, [page]);

  const { data, isLoading, refetch } = useGetDeletedProjectsQuery(query);

  const [selected, setSelected] = useState<number[]>([]);
  const [bulkRecover, { isLoading: bulkLoading }] =
    useBulkRecoverProjectsMutation();

  const results = data?.results ?? [];
  const total = data?.count ?? 0;
  const offset = (page - 1) * PAGE_SIZE;

  const toggleSelect = (id: number | string, checked: boolean) => {
    const num = Number(id);
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, num]))
        : prev.filter((x) => x !== num)
    );
  };

  const handleRecoverSelected = async () => {
    if (selected.length === 0) return;
    try {
      await bulkRecover({ ids: selected }).unwrap();
      setSelected([]);
      // Adjust page if needed
      const remaining = Math.max(total - selected.length, 0);
      const lastPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
      setPage((p) => Math.min(p, lastPage));
      refetch();
    } catch (e) {
      console.error("Bulk recover failed:", e);
      alert("Failed to recover selected projects.");
    }
  };

  // Keep page in range if total changes externally
  useEffect(() => {
    if (!total) {
      if (page !== 1) setPage(1);
      return;
    }
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
  }, [total, page]);

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + results.length, total);
  const canPrev = page > 1;
  const canNext = end < total;

  if (isLoading) return <p>Loading deleted projects...</p>;

  return (
    <>
      <h2>Deleted Projects</h2>

      <Bar>
        <Button
          onClick={handleRecoverSelected}
          disabled={selected.length === 0 || bulkLoading}
        >
          {bulkLoading
            ? "Recovering..."
            : `Recover Selected (${selected.length})`}
        </Button>

        {selected.length > 0 && (
          <Button variant="outline" onClick={() => setSelected([])}>
            Clear Selection
          </Button>
        )}

        <div style={{ marginLeft: "auto", opacity: 0.7, fontSize: "0.9rem" }}>
          {total > 0 ? `${start}-${end} of ${total}` : "0 results"}
        </div>
      </Bar>

      <Grid>
        {results.map((p) => (
          <div key={p.id} style={{ position: "relative" }}>
            <ProjectCard
              project={p}
              selected={selected.includes(Number(p.id))}
              onSelect={toggleSelect}
            />
          </div>
        ))}
      </Grid>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outline"
          onClick={() => canPrev && setPage((pg) => pg - 1)}
          disabled={!canPrev}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          onClick={() => canNext && setPage((pg) => pg + 1)}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </>
  );
};
