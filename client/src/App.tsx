import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { Dashboard } from "./pages/Dashboard";
import { DeletedProjects } from "./pages/DeletedProjects";
import { useGetCsrfQuery } from "./app/api/projectApi";
import { ProjectDetails } from "./pages/ProjectDetails";

export default function App() {
  const { isSuccess } = useGetCsrfQuery();

  if (!isSuccess) return <div style={{ padding: 16 }}>Initializing…</div>;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deleted" element={<DeletedProjects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
