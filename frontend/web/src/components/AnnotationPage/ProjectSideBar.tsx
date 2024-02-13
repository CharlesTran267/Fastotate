'use client';
import { FaEdit } from 'react-icons/fa';
import {
  Annotation,
  Project,
  useAnnotationSessionStore,
} from '@/stores/useAnnotationSessionStore';
import { useEffect, useState } from 'react';

export default function ProjectSideBar() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedAnnotation = sessionActions.getSelectedAnnotation();

  const handledeleteImage = () => {
    // let newProject = {...project};
    // newProject.project_name = 'new Name';
    // sessionActions.setProject(newProject as Project);
  };

  const handleSetDefaultClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newProject = { ...project } as Project;
    newProject.default_class = e.target.value;
    sessionActions.setProject(newProject);
  };

  const handleChangeClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newSelectedAnnotation = { ...selectedAnnotation } as Annotation;
    newSelectedAnnotation.className = e.target.value;
    sessionActions.setSelectedAnnotation(newSelectedAnnotation);
  };

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

  const [newClassInput, setNewClassInput] = useState<string | null>(null);
  const handleChangeClassInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassInput(e.target.value);
  };
  const handleSaveAddNewClass = () => {
    let newProject = new Project(project);
    newProject.addClass(newClassInput!);
    sessionActions.setProject(newProject);
  };
  return (
    <aside className="flex h-full w-60 flex-col bg-neutral">
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
                  disabled={
                    projectNameInput === null || projectNameInput === ''
                  }
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
      <div className="flex h-4/6 flex-col justify-between border-b-4 border-base-100">
        <div className="max-h-full overflow-y-auto border-b-2 border-base-100">
          <table className="table table-pin-rows table-pin-cols text-base-100">
            <thead className="font-black">
              <tr>
                <th className="w-3/5">File Name</th>
                <th className="w-2/5 p-1">Annotations</th>
              </tr>
            </thead>
            <tbody>
              {project.images.map((image) => (
                <tr
                  className="bg-neutral hover:bg-slate-500"
                  key={image.id}
                  onClick={() => sessionActions.setSelectedImage(image)}
                >
                  <td className="h-10 whitespace-nowrap">{image.file_name}</td>
                  <th className="bg-neutral text-center">
                    {image.annotations.length}
                  </th>
                </tr>
              ))}
              {[...Array(12 - project.images.length)].map((_, i) => (
                <tr className="bg-neutral hover:bg-slate-500" key={i}>
                  <td className="h-10 whitespace-nowrap"></td>
                  <th className="bg-neutral text-center"></th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-3 mt-5 flex justify-evenly">
          <button className="btn btn-accent p-1">Upload</button>
          <button className="btn btn-error p-1" onClick={handledeleteImage}>
            Delete
          </button>
        </div>
      </div>
      <div className="flex h-full flex-col items-center">
        <h1 className="mt-3 text-xl font-bold text-base-100">
          Annotation Editor
        </h1>
        <div className="flex h-full flex-col justify-evenly">
          <div>
            <h2 className="font-bold text-base-100">Class Name:</h2>
            <select
              className="select select-bordered w-full border-2 border-base-100 bg-neutral text-base-100 focus:border-base-100 disabled:bg-neutral disabled:text-red-600"
              disabled={selectedAnnotation === null}
              onChange={handleChangeClass}
              value={selectedAnnotation?.className || 'None selected'}
            >
              {selectedAnnotation === null ? (
                <option>None selected</option>
              ) : (
                <>
                  {project.classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option
                    onClick={() =>
                      (
                        document.getElementById(
                          'add_new_class_modal',
                        ) as HTMLDialogElement
                      ).showModal()
                    }
                  >
                    + Add new option
                  </option>
                </>
              )}
            </select>
            <dialog
              id="add_new_class_modal"
              className="modal modal-bottom sm:modal-middle"
            >
              <div className="modal-box">
                <h3 className="mb-3 text-lg font-bold">Add new class</h3>
                <input
                  id="new_class_input"
                  type="text"
                  placeholder="New Class"
                  className="input input-bordered input-info w-full"
                  onChange={handleChangeClassInput}
                />
                <div className="modal-action">
                  <form method="dialog">
                    <button
                      className="btn btn-success mx-2 py-1"
                      disabled={newClassInput === null || newClassInput === ''}
                      onClick={handleSaveAddNewClass}
                    >
                      Save
                    </button>
                    <button className="btn btn-error py-1">Discard</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
          <div>
            <h2 className="font-bold text-base-100">Default Class:</h2>
            <select
              defaultValue="Default Class"
              className="select select-bordered w-full border-2 border-base-100 bg-neutral text-base-100 focus:border-base-100"
              onChange={handleSetDefaultClass}
            >
              {project.classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
