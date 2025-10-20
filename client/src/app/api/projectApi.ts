import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Project } from "../../types/project";

export interface PaginatedProjects {
  count: number;
  limit: number;
  offset: number;
  results: Project[];
}

// tiny helper to read a cookie by name
function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1];

  return match ? decodeURIComponent(match) : undefined;
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getCookie("csrftoken");
      if (token) {
        headers.set("X-CSRFToken", token);
        headers.set("X-Requested-With", "XMLHttpRequest");
      }
      return headers;
    },
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    // Call this once on app load to set the csrftoken cookie
    getCsrf: builder.query<{ detail: string }, void>({
      query: () => "csrf/",
    }),

    getOwners: builder.query<string[], void>({
      query: () => "projects/filters/owners/",
    }),
    getTags: builder.query<string[], void>({
      query: () => "projects/filters/tags/",
    }),
    getStatuses: builder.query<string[], void>({
      query: () => "projects/filters/status/",
    }),
    getHealths: builder.query<string[], void>({
      query: () => "projects/filters/health/",
    }),

    // List with filters
    getProjects: builder.query<
      PaginatedProjects,
      {
        limit?: number;
        offset?: number;
        search?: string;
        status?: string;
        owner?: string;
        tag?: string[];
        health?: string;
      }
    >({
      query: (params) => ({ url: "projects/", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: "Project" as const,
                id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // Single project
    getProjectById: builder.query<Project, number>({
      query: (id) => `projects/${id}/`,
      providesTags: (result) =>
        result ? [{ type: "Project", id: result.id }] : [],
    }),

    // Create
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (body) => ({
        url: "projects/",
        method: "POST",
        body,
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // Update
    updateProject: builder.mutation<
      Project,
      { id: number; body: Partial<Project>; version?: number }
    >({
      query: ({ id, body, version }) => ({
        url: `projects/${id}/`,
        method: "PATCH",
        body,
        headers: version ? { "If-Match": `W/"${version}"` } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (id) => ({ url: `projects/${id}/`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        { type: "Project", id: "DELETED_LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Optimistically remove this project from ALL cached getProjects queries
        const patches: Array<{ undo: () => void }> = [];
        const state = getState() as any;
        const cache = state.projectApi.queries as Record<string, any>;
        for (const key of Object.keys(cache)) {
          if (!key.startsWith("getProjects(")) continue;
          // parse cached args from the key
          const argsJson = key.slice("getProjects(".length, -1);
          const args = argsJson ? JSON.parse(argsJson) : undefined;
          patches.push(
            dispatch(
              projectApi.util.updateQueryData(
                "getProjects",
                args,
                (draft: { results: any[]; count: number }) => {
                  const before = draft.results.length;
                  draft.results = draft.results.filter((p) => p.id !== id);
                  if (draft.results.length !== before && draft.count > 0) {
                    draft.count -= 1;
                  }
                }
              )
            )
          );
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    // Bulk update
    bulkUpdateProjects: builder.mutation<
      { updated_count: number; requested_ids: number[]; found_ids: number[] },
      {
        ids: number[];
        status?: string;
        owner?: string;
        health?: string;
        tag?: string;
      }
    >({
      query: ({ ids, status, tag }) => ({
        url: "projects/bulk-update/",
        method: "POST",
        body: {
          ids,
          ...(status ? { status } : {}),
          ...(tag ? { tag } : {}),
        },
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // List deleted projects (paginated like normal list)
    getDeletedProjects: builder.query<
      PaginatedProjects,
      { limit?: number; offset?: number }
    >({
      query: (params) => ({
        url: "projects/deleted/",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: "Project" as const,
                id,
              })),
              { type: "Project", id: "DELETED_LIST" },
            ]
          : [{ type: "Project", id: "DELETED_LIST" }],
    }),

    // Recover single project
    recoverProject: builder.mutation<Project, number>({
      query: (id) => ({ url: `projects/${id}/recover/`, method: "POST" }),
      invalidatesTags: [
        { type: "Project", id: "LIST" },
        { type: "Project", id: "DELETED_LIST" },
      ],
    }),

    // Bulk recover
    bulkRecoverProjects: builder.mutation<
      { updated_count: number; requested_ids: number[]; found_ids: number[] },
      { ids: number[] }
    >({
      query: ({ ids }) => ({
        url: "projects/bulk-recover/",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: [
        { type: "Project", id: "LIST" },
        { type: "Project", id: "DELETED_LIST" },
      ],
    }),
  }),
});

export const {
  useGetCsrfQuery,
  useGetOwnersQuery,
  useGetTagsQuery,
  useGetStatusesQuery,
  useGetHealthsQuery,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useBulkUpdateProjectsMutation,
  useGetDeletedProjectsQuery,
  useRecoverProjectMutation,
  useBulkRecoverProjectsMutation,
} = projectApi;
