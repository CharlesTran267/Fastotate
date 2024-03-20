import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import EditClassesModal from './EditClassesModal';

export function AnnotationEditor() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedAnnotationID = useAnnotationSessionStore(
    (state) => state.selectedAnnotationID,
  );
  const selectedAnnotation = sessionActions.getSelectedAnnotation();

  const handleSetDefaultClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sessionActions.changeDefaultClass(e.target.value);
  };

  const handleChangeClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    sessionActions.modifySelectedAnnotation(
      selectedAnnotation!.points,
      e.target.value,
      selectedAnnotation!.annotation_id,
    );
  };

  const handleOpenEditClassModal = () => {
    const modal = document.getElementById(
      'edit_classes_modal',
    ) as HTMLDialogElement;
    modal.showModal();
  };

  return (
    <div className="flex h-1/4 min-h-40 flex-col items-center border-b-4 border-base-100">
      <h1 className="mt-3 text-xl font-bold text-base-100">
        Annotation Editor
      </h1>
      <div className="flex h-full w-4/5 flex-col justify-evenly">
        <div>
          <EditClassesModal />
          <div className="flex justify-between">
            <h2 className="font-bold text-base-100">Class Name:</h2>
            <a
              className="link mb-1 mt-auto text-xs font-black text-base-100"
              onClick={handleOpenEditClassModal}
            >
              Edit
            </a>
          </div>
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
                {project &&
                  project.classes.map((c) => <option key={c}>{c}</option>)}
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
