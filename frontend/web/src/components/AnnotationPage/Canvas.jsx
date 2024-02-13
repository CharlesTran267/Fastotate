'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { remToPixels } from '../../utils/utils';
import {
  useAnnotationSessionStore,
  Annotation,
  ImageAnnotation,
} from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';

const RectangleAnnotation = dynamic(() => import('./RectangleAnnotation'), {
  ssr: false,
});

const PolygonAnnotation = dynamic(() => import('./PolygonAnnotation'), {
  ssr: false,
});

export default function Canvas() {
  const defaultWidthinRem = 52;

  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );
  const project = useAnnotationSessionStore((state) => state.project);
  const selectedImage = sessionActions.getSelectedImage();

  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({});

  const [mousePos, setMousePos] = useState([0, 0]);
  const [isMouseOverPoint, setMouseOverPoint] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(new Annotation());

  const imageElement = useMemo(() => {
    if (typeof window !== 'undefined' && selectedImage !== null) {
      const element = new window.Image();
      element.src = selectedImage.file_src;
      element.width = remToPixels(defaultWidthinRem);
      element.height =
        (selectedImage.height / selectedImage.width) * element.width;
      return element;
    }
    return null;
  }, [selectedImage]);

  useEffect(() => {
    if (imageElement === null) return;
    const onload = function () {
      setImageSize({
        width: imageElement.width,
        height: imageElement.height,
      });
      setImage(imageElement);
      imageRef.current = imageElement;
    };
    imageElement.addEventListener('load', onload);
    return () => {
      imageElement.removeEventListener('load', onload);
    };
  }, [imageElement]);

  const getMousePos = (stage) => {
    return [stage.getPointerPosition().x, stage.getPointerPosition().y];
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (
        annotationMode === AnnotationMode.POLYGON ||
        annotationMode === AnnotationMode.RECTANGLE
      ) {
        if (e.key === 'Escape') {
          setCurrentAnnotation(new Annotation());
        } else if (e.key === ' ') {
          if (currentAnnotation.points.length > 2) {
            let newSelectedImage = { ...selectedImage };
            currentAnnotation.isFinished = true;
            currentAnnotation.className = project.default_class;
            newSelectedImage.annotations.push(currentAnnotation);
            sessionActions.setSelectedImage(newSelectedImage);
            setCurrentAnnotation(new Annotation());
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentAnnotation]);

  useEffect(() => {
    if (
      annotationMode !== AnnotationMode.POLYGON ||
      annotationMode !== AnnotationMode.RECTANGLE
    ) {
      setCurrentAnnotation(new Annotation());
    }
  }, [annotationMode]);

  //drawing begins when mousedown event fires.
  const handleMouseDown = (e) => {
    if (
      !(
        annotationMode === AnnotationMode.POLYGON ||
        annotationMode === AnnotationMode.RECTANGLE
      ) ||
      isMouseOverPoint
    )
      return;
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setCurrentAnnotation({
      ...currentAnnotation,
      points: [...currentAnnotation.points, mousePos],
    });
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setMousePos(mousePos);
  };

  const handlePointDragMove = (e, annotation_id) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    let newImageAnnotation = { ...selectedImage };
    newImageAnnotation.annotations.map((annotation) => {
      if (annotation.id === annotation_id) {
        annotation.points[index] = pos;
      }
    });
    sessionActions.setSelectedImage(newImageAnnotation);
  };

  const handleGroupDragEnd = (e, annotation_id) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    if (e.target.name() === 'polygon') {
      let newImageAnnotation = { ...selectedImage };
      newImageAnnotation.annotations.map((annotation) => {
        if (annotation.id === annotation_id) {
          let result = [];
          let copyPoints = [...annotation.points];
          copyPoints.map((point) =>
            result.push([point[0] + e.target.x(), point[1] + e.target.y()]),
          );
          e.target.position({ x: 0, y: 0 });
          annotation.points = result;
        }
      });
      sessionActions.setSelectedImage(newImageAnnotation);
    }
  };

  useEffect(() => {
    sessionActions.setZoomCenter({ x: mousePos[0], y: mousePos[1] });
  }, [mousePos]);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-center">
        <div className="max-w-4xl">
          {selectedImage !== null ? (
            <Stage
              width={imageSize.width || 650}
              height={imageSize.height || 302}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
            >
              <Layer>
                <Image
                  ref={imageRef}
                  image={image}
                  x={0}
                  y={0}
                  width={imageSize.width}
                  height={imageSize.height}
                  onClick={() => sessionActions.setSelectedAnnotation(null)}
                />
                {selectedImage.annotations.map((annotation) => {
                  return (
                    <PolygonAnnotation
                      key={annotation.id}
                      annotation={annotation}
                      mousePos={mousePos}
                      handlePointDragMove={handlePointDragMove}
                      handleGroupDragEnd={handleGroupDragEnd}
                      setMouseOverPoint={setMouseOverPoint}
                    />
                  );
                })}
                <PolygonAnnotation
                  annotation={currentAnnotation}
                  mousePos={mousePos}
                  handlePointDragMove={handlePointDragMove}
                  handleGroupDragEnd={handleGroupDragEnd}
                  setMouseOverPoint={setMouseOverPoint}
                />
              </Layer>
            </Stage>
          ) : null}
        </div>
      </div>
    </div>
  );
}
