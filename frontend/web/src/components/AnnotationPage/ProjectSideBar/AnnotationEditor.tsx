import { useState } from 'react';
import {
  useAnnotationSessionStore,
  Project,
  Annotation,
} from '@/stores/useAnnotationSessionStore';
import { IoIosCloseCircleOutline } from 'react-icons/io';

export function AnnotationEditor() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedAnnotation = sessionActions.getSelectedAnnotation();

  const handleSetDefaultClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newProject = { ...project } as Project;
    newProject.default_class = e.target.value;
    sessionActions.setProject(newProject);
  };

  const handleChangeClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '+ Add new option') return;
    let newSelectedAnnotation = { ...selectedAnnotation } as Annotation;
    newSelectedAnnotation.className = e.target.value;
    sessionActions.setSelectedAnnotation(newSelectedAnnotation);
  };

  const [newClassInput, setNewClassInput] = useState<string | null>(null);
  const handleChangeClassInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassInput(e.target.value);
  };
  const handleSaveAddNewClass = () => {
    let newProject = new Project(project);
    newProject.addClass(newClassInput!);
    if (selectedAnnotation) {
      let newSelectedAnnotation = { ...selectedAnnotation } as Annotation;
      newSelectedAnnotation.className = newClassInput!;
      sessionActions.setSelectedAnnotation(newSelectedAnnotation);
    }
    sessionActions.setProject(newProject);
  };

  return (
    <div className="flex h-full flex-col items-center border-b-4 border-base-100">
      <h1 className="mt-3 text-xl font-bold text-base-100">
        Annotation Editor
      </h1>
      <div className="flex h-full w-4/5 flex-col justify-evenly">
        <div>
          <h2 className="font-bold text-base-100">Class Name:</h2>
          <select
            className="select select-bordered w-full border-2 border-base-100 bg-neutral text-base-100 focus:border-base-100 disabled:bg-neutral disabled:text-red-600"
            disabled={selectedAnnotation === null}
            onChange={handleChangeClass}
            value={selectedAnnotation?.className}
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
  );
}
