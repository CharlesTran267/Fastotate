import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import {
  useAnnotationSessionStore,
  Project,
} from '@/stores/useAnnotationSessionStore';

export function ProjectNameEditor() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);

  const [projectNameInput, setProjectNameInput] = useState<string | null>(null);
  const handleProjectNameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setProjectNameInput(e.target.value);
  };
  const handleSaveNewProjectName = () => {
    let newProject = { ...project } as Project;
    newProject.project_name = projectNameInput!;
    sessionActions.setProject(newProject);
  };
  return (
    <div className="flex items-center justify-center border-b-4 border-base-100">
      <h2 className="text-xl font-bold text-base-100">
        {project.project_name}
      </h2>
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
        <FaEdit size={20} color="#151726" />
      </button>
      <dialog
        id="edit_project_name_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="mb-3 text-lg font-bold">Edit Project Name</h3>
          <input
            id="project_name_input"
            type="text"
            placeholder="New Project Name"
            className="input input-bordered input-info w-full"
            onChange={handleProjectNameInputChange}
          />
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-success mx-2 py-1"
                disabled={projectNameInput === null || projectNameInput === ''}
                onClick={handleSaveNewProjectName}
              >
                Save
              </button>
              <button className="btn btn-error py-1">Discard</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
