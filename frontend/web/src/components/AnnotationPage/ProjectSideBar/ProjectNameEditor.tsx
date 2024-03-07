import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import {
  useAnnotationSessionStore,
  Project,
} from '@/stores/useAnnotationSessionStore';
import ProjectNameModal from '@/components/ProjectNameModal';

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
    sessionActions.changeProjectName(projectNameInput!);
  };
  return (
    <div className="flex items-center justify-center border-b-4 border-base-100">
      <h2 className="text-xl font-bold text-base-100">
        {project ? project.name : null}
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
      <ProjectNameModal
        projectNameInput={projectNameInput}
        handleProjectNameInputChange={handleProjectNameInputChange}
        handleSaveNewProjectName={handleSaveNewProjectName}
      />
    </div>
  );
}
