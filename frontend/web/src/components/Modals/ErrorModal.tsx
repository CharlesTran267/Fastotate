export default function ErrorModal(props: any) {
  const { modal_id, modal_title, modal_message } = props;

  return (
    <dialog id={modal_id} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{modal_title}</h3>
        <p className="py-4">{modal_message}</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-error">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
