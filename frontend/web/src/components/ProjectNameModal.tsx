export default function ProjectNameModal(props: any) {
  const {
    projectNameInput,
    handleProjectNameInputChange,
    handleSaveNewProjectName,
  } = props;
  return (
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
  );
}
