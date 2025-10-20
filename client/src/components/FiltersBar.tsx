import { useState, useMemo } from "react";
import {
  Wrapper,
  Input,
  Select,
  TagInput,
  ClearButton,
} from "../assets/styles/theme";
import {
  useGetHealthsQuery,
  useGetOwnersQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
} from "../app/api/projectApi";
import type { Filters } from "../types/filters";

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export const FiltersBar = ({ filters, onChange }: FiltersBarProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: owners } = useGetOwnersQuery();
  const { data: tags } = useGetTagsQuery();
  const { data: statuses } = useGetStatusesQuery();
  const { data: healths } = useGetHealthsQuery();

  const handleChange = (key: keyof Filters, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleClearFilters = () => {
    const cleared: Filters = {};
    setLocalFilters(cleared);
    onChange(cleared);
  };

  // Determine if any filter is active
  const hasActiveFilters = useMemo(
    () =>
      !!(
        localFilters.q ||
        localFilters.status ||
        localFilters.owner ||
        localFilters.health ||
        localFilters.tags
      ),
    [localFilters]
  );

  return (
    <Wrapper
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "0",
        gap: "8px",
      }}
    >
      <Input
        placeholder="Search projects..."
        value={localFilters.q || ""}
        onChange={(e) => handleChange("q", e.target.value)}
      />

      <Select
        value={localFilters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
      >
        <option value="">All Statuses</option>
        {statuses?.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select
        value={localFilters.health || ""}
        onChange={(e) => handleChange("health", e.target.value)}
      >
        <option value="">All Health</option>
        {healths?.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </Select>

      <Select
        value={localFilters.tags || ""}
        onChange={(e) => handleChange("tags", e.target.value)}
      >
        <option value="">All Tags</option>
        {tags?.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      <TagInput
        placeholder="Filter by owner"
        value={localFilters.owner || ""}
        onChange={(e) => handleChange("owner", e.target.value)}
        list="owners-list"
      />
      <datalist id="owners-list">
        {owners?.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>

      {/* Show Clear Filters only when filters are active */}
      {hasActiveFilters && (
        <ClearButton onClick={handleClearFilters}>X</ClearButton>
      )}
    </Wrapper>
  );
};
