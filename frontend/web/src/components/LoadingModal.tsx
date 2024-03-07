export function LoadingModal(props: any) {
    const { modal_id, modal_title, modal_message } = props;
    const handleKeyDownDialog = (e: any) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <dialog id={modal_id} className="modal" onKeyDown={handleKeyDownDialog}>
            <div className="modal-box">
                <div className="flex">
                    <h3 className="text-lg font-bold">{modal_title}</h3>
                    <span className="loading loading-spinner loading-sm mx-3"></span>
                </div>
                <p className="py-4">{modal_message}</p>
            </div>
        </dialog>
    );
}
