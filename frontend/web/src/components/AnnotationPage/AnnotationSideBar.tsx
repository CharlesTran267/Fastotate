'use client';
import { FaDrawPolygon } from 'react-icons/fa6';
import { PiRectangleBold } from 'react-icons/pi';
import { FaArrowPointer } from 'react-icons/fa6';
import { MdDeleteForever } from 'react-icons/md';
import { ImZoomIn } from 'react-icons/im';
import { ImZoomOut } from 'react-icons/im';
import { useEffect, useState } from 'react';
import { AnnotationMode } from '@/types/AnnotationMode';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function AnnotationSideBar() {
  const actions = useAnnotationSessionStore((state) => state.actions);
  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's') {
        actions.setAnnotationMode(AnnotationMode.SELECT);
      } else if (e.key === 'p') {
        actions.setAnnotationMode(AnnotationMode.POLYGON);
      } else if (e.key === 'r') {
        actions.setAnnotationMode(AnnotationMode.RECTANGLE);
      } else if (e.key === 'd' && annotationMode === AnnotationMode.SELECT) {
        handleDeleteSelectedAnnotation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleDeleteSelectedAnnotation = () => {
    actions.deleteSelectedAnnotation();
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
          <button className="btn btn-ghost p-1">
            <ImZoomIn size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Zoom Out">
          <button className="btn btn-ghost p-1">
            <ImZoomOut size={20} />
          </button>
        </div>
        <div className="tooltip tooltip-right" data-tip="Delete">
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
