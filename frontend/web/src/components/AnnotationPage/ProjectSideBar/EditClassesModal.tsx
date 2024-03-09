import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { useEffect, useState } from 'react';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { FaX } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa';
import { add, set } from 'lodash';

export default function EditClassesModal() {
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const project = useAnnotationSessionStore((state) => state.project);

  const [classes, setClasses] = useState<string[]>(project?.classes || []);
  const [defaultClass, setDefaultClass] = useState<string>(
    project?.default_class || '',
  );

  const handleChangeDefaultClass = (c: string) => {
    setDefaultClass(c);
  };

  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [addClassError, setAddClassError] = useState('');
  const [deleteClassError, setDeleteClassError] = useState('');

  const handleAddClass = () => {
    if (classes.includes(newClass)) {
      setAddClassError('Class already exists');
      setTimeout(() => setAddClassError(''), 3000);
      return;
    }
    setClasses([...classes, newClass]);
    setAddingClass(false);
  };

  const handleDeleteClass = (c: string) => {
    if (c === defaultClass) {
      setDeleteClassError('Cannot delete default class!');
      setTimeout(() => setDeleteClassError(''), 3000);
      return;
    } else if (classes.length === 1) {
      setDeleteClassError('Cannot delete last class!');
      setTimeout(() => setDeleteClassError(''), 3000);
      return;
    }
    setClasses(classes.filter((cl) => cl !== c));
  };

  const handleDiscard = () => {
    setClasses(project?.classes || []);
    setDefaultClass(project?.default_class || '');
  };

  const handleSave = () => {
    sessionActions.setClasses(classes, defaultClass);
  };

  useEffect(() => {
    if (!addingClass) {
      setNewClass('');
      setAddClassError('');
    }
  }, [addingClass]);

  const handleKeyDown = (e: any) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <dialog
      id="edit_classes_modal"
      className="modal modal-bottom sm:modal-middle"
      onKeyDown={handleKeyDown}
    >
      <div className="modal-box">
        <h3 className="mb-3 text-lg font-bold">Classes Editor</h3>
        <div className="max-h-96 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Set Default</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr>
                  <td>{c}</td>
                  <td className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="radio-1"
                      className="radio"
                      checked={c === defaultClass}
                      onClick={() => handleChangeDefaultClass(c)}
                    />
                    <button
                      className="btn btn-ghost mb-2 p-0 opacity-80"
                      onClick={() => handleDeleteClass(c)}
                    >
                      <RiDeleteBin5Line size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ml-4 text-sm text-error">{deleteClassError}</p>
        {addingClass ? (
          <div className="flex">
            <div>
              <input
                type="text"
                placeholder="New Class"
                className="input input-sm input-bordered m-2"
                onChange={(e) => setNewClass(e.target.value)}
              />
              <p className="ml-4 text-sm text-error">{addClassError}</p>
            </div>
            <button
              className="btn btn-ghost link mx-2 p-0 opacity-80"
              onClick={handleAddClass}
            >
              <FaCheck size={15} />
            </button>
            <button
              className="btn btn-ghost link m-0 p-0 opacity-80"
              onClick={() => setAddingClass(false)}
            >
              <FaX size={15} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-ghost link"
            onClick={() => setAddingClass(true)}
          >
            Add new class
          </button>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-success mx-2 py-1" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-error py-1" onClick={handleDiscard}>
              Discard
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
