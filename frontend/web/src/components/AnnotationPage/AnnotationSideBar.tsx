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
import { KonvaNodeComponent, StageProps } from 'react-konva';
import { Stage } from 'konva/lib/Stage';

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
            <PiRectangleBold size={20} />
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
