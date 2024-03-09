'use client';
import { FaDrawPolygon } from 'react-icons/fa6';
import { PiRectangleBold } from 'react-icons/pi';
import { FaArrowPointer } from 'react-icons/fa6';
import { MdDeleteForever } from 'react-icons/md';
import { ImZoomIn } from 'react-icons/im';
import { ImZoomOut } from 'react-icons/im';
import { FaMagic } from 'react-icons/fa';
import { useEffect } from 'react';
import { AnnotationMode } from '@/types/AnnotationMode';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function AnnotationSideBar() {
  const actions = useAnnotationSessionStore((state) => state.actions);
  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modalList = [
        'error_modal',
        'add_new_class_modal',
        'edit_project_name_modal',
        'setting_image_modal',
        'exporting_modal',
      ];
      for (const modal of modalList) {
        const modalElement = document.getElementById(
          modal,
        ) as HTMLDialogElement;
        if (modalElement && modalElement.open) {
          return;
        }
      }
      if (e.key === 's' || e.key === 'S') {
        actions.setAnnotationMode(AnnotationMode.SELECT);
      } else if (e.key === 'p' || e.key === 'P') {
        actions.setAnnotationMode(AnnotationMode.POLYGON);
      } else if (e.key === 'r' || e.key === 'R') {
        actions.setAnnotationMode(AnnotationMode.RECTANGLE);
      } else if (
        (e.key === 'd' || e.key === 'D') &&
        annotationMode === AnnotationMode.SELECT
      ) {
        handleDeleteSelectedAnnotation();
      } else if (e.key === 'm' || e.key === 'M') {
        actions.setAnnotationMode(AnnotationMode.MAGIC);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleDeleteSelectedAnnotation = () => {
    actions.removeSelectedAnnotation();
  };

  const zoomFactor = 1.1;

  const zoomLevel = useAnnotationSessionStore((state) => state.zoomLevel);

  const handleZoomIn = () => {
    let newScale = zoomLevel * zoomFactor;
    if (newScale > 10) {
      newScale = 10;
    }
    actions.setZoomLevel(newScale);
  };

  const handleZoomOut = () => {
    let newScale = zoomLevel / zoomFactor;
    if (newScale < 1) {
      newScale = 1;
    }
    actions.setZoomLevel(newScale);
  };

  return (
    <aside className="w-18 flex h-full flex-col bg-base-100 py-6 text-neutral">
      <div className="flex flex-1 flex-col justify-center">
        <div className="tooltip tooltip-right" data-tip="Select (s)">
          <button
            className="btn btn-ghost p-1"
            onClick={() => actions.setAnnotationMode(AnnotationMode.SELECT)}
            style={{
              backgroundColor:
                annotationMode === AnnotationMode.SELECT
                  ? 'var(--fallback-bc,oklch(var(--bc)/0.2))'
                  : '',
            }}
          >
            <FaArrowPointer size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Magic Mode (m)">
          <button
            className="btn btn-ghost p-1"
            onClick={() => actions.setAnnotationMode(AnnotationMode.MAGIC)}
            style={{
              backgroundColor:
                annotationMode === AnnotationMode.MAGIC
                  ? 'var(--fallback-bc,oklch(var(--bc)/0.2))'
                  : '',
            }}
          >
            <FaMagic size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Polygon (p)">
          <button
            className="btn btn-ghost p-1"
            onClick={() => actions.setAnnotationMode(AnnotationMode.POLYGON)}
            style={{
              backgroundColor:
                annotationMode === AnnotationMode.POLYGON
                  ? 'var(--fallback-bc,oklch(var(--bc)/0.2))'
                  : '',
            }}
          >
            <FaDrawPolygon size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Rectangle (r)">
          <button
            className="btn btn-ghost p-1"
            onClick={() => actions.setAnnotationMode(AnnotationMode.RECTANGLE)}
            style={{
              backgroundColor:
                annotationMode === AnnotationMode.RECTANGLE
                  ? 'var(--fallback-bc,oklch(var(--bc)/0.2))'
                  : '',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 448 512"
              className="h-[22px] w-[22px]"
            >
              <path
                fill="currentColor"
                d="M416 360.88V151.12c19.05-11.09 32-31.49 32-55.12 0-35.35-28.65-64-64-64-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-23.63-12.94-44.04-31.99-55.12zm-320 0V151.12A63.825 63.825 0 0 0 119.12 128h209.75a63.825 63.825 0 0 0 23.12 23.12v209.75a63.825 63.825 0 0 0-23.12 23.12H119.12A63.798 63.798 0 0 0 96 360.88zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z"
              ></path>
            </svg>{' '}
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Zoom In">
          <button className="btn btn-ghost p-1" onClick={handleZoomIn}>
            <ImZoomIn size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Zoom Out">
          <button className="btn btn-ghost p-1" onClick={handleZoomOut}>
            <ImZoomOut size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Delete (d)">
          <button
            className="btn btn-ghost p-1"
            onClick={handleDeleteSelectedAnnotation}
          >
            <MdDeleteForever size={25} />
          </button>
        </div>
      </div>
    </aside>
  );
}
