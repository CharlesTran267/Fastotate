'use client';
import { useUserSessionStore } from '@/stores/useUserSessionStore';
import { useEffect, useState } from 'react';
import { ProjectSummary } from '@/stores/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import ProjectNameModal from '@/components/Modals/ProjectNameModal';
import { createProject } from '@/utils/utils';

export default function ProjectsPage() {
  const router = useRouter();

  const userSessionActions = useUserSessionStore((state) => state.actions);
  const session_token = useUserSessionStore((state) => state.session_token);
  const [projects, setProjects] = useState<ProjectSummary[] | null>([]);

  const fetchProjects = async () => {
    setLoading(true);
    const response = await userSessionActions.getProjectsSummary();
    setProjects(response);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    fetchProjects();
  }, [session_token]);

  const handleCreateProject = async () => {
    const project_id = await createProject(session_token);
    router.push(`/annotation/${project_id}`);
  };

  const handleOpenProject = (project_id: string) => {
    router.push(`/annotation/${project_id}`);
  };

  const handleExportProject = async (project_id: string) => {
    const backendURL = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(
      `${backendURL}/get-coco-format?project_id=${project_id}`,
    );
    const exportedData = response.data.data;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportedData),
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.setAttribute('download', `${project_id}-annotations.coco.json`); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteProject = async (project_id: string) => {
    await userSessionActions.deleteProject(project_id);
    await fetchProjects();
  };

  const [projectNameInput, setProjectNameInput] = useState<string | null>(null);
  const handleProjectNameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setProjectNameInput(e.target.value);
  };

  const handleSaveNewProjectName = async (project_id: string) => {
    await userSessionActions.changeProjectName(project_id, projectNameInput!);
    await fetchProjects();
  };
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [currentPageProjects, setCurrentPageProjects] = useState<
    ProjectSummary[]
  >([]);

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    setMaxPage(Math.ceil(projects.length / pageSize));
    setCurrentPageProjects(
      projects.slice((page - 1) * pageSize, page * pageSize),
    );
  }, [projects, page]);
  return (
    <div className="h-full w-full">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {!projects || projects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className="my-6 text-xl font-black">No Projects found!</h2>
              <button
                className="btn btn-primary p-2 text-lg font-black"
                onClick={handleCreateProject}
              >
                Create new project
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center">
              <h2 className="my-10 text-2xl font-black">Projects</h2>
              <div className="flex h-full flex-wrap justify-center gap-10">
                {currentPageProjects.map((project: ProjectSummary) => (
                  <div className="w-100 card mb-auto bg-base-100 shadow-xl">
                    <ProjectNameModal
                      projectNameInput={projectNameInput}
                      handleProjectNameInputChange={
                        handleProjectNameInputChange
                      }
                      handleSaveNewProjectName={() =>
                        handleSaveNewProjectName(project.project_id)
                      }
                    />
                    <div className="card-body">
                      <div className="flex">
                        <h2 className="card-title">{project.name}</h2>
                        <button
                          className="btn btn-ghost p-2"
                          onClick={() =>
                            (
                              document.getElementById(
                                'edit_project_name_modal',
                              ) as HTMLDialogElement
                            ).showModal()
                          }
                        >
                          <FaEdit size={18} />
                        </button>
                      </div>
                      <p>Project ID: {project.project_id}</p>
                      <p>Num Images: {project.num_images}</p>
                      <p>Num Classes: {project.classes.length}</p>
                      <p>Default Class: {project.default_class}</p>
                      <div className="card-actions mt-2 justify-center gap-4">
                        <button
                          className="btn btn-success p-1 font-black"
                          onClick={() => handleOpenProject(project.project_id)}
                        >
                          Open Project
                        </button>
                        <button
                          className="btn btn-warning p-1 font-black"
                          onClick={() =>
                            handleExportProject(project.project_id)
                          }
                        >
                          Export Project
                        </button>
                        <button
                          className="btn btn-error p-1 font-black"
                          onClick={() =>
                            handleDeleteProject(project.project_id)
                          }
                        >
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="join mb-2 mt-auto">
                {Array.from({ length: maxPage }, (_, i) => i + 1).map(
                  (page_num) => (
                    <input
                      className="btn btn-square join-item"
                      type="radio"
                      name="options"
                      aria-label={`${page_num}`}
                      checked={page_num == page}
                      onClick={() => setPage(page_num)}
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
