'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { remToPixels } from '../../utils/utils';
import {
  useAnnotationSessionStore,
  Annotation,
} from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';
import { getImage } from '@/stores/imageDatabase';

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

  const imageElement = useMemo(async () => {
    if (typeof window !== 'undefined' && selectedImage !== null) {
      const element = new window.Image();
      let success = false;
      await getImage(selectedImage.db_key)
        .then((res) => {
          if (res === null || res === undefined) return null;
          element.src = URL.createObjectURL(res);
          success = true;
        })
        .catch((e) => {
          console.error(e);
        });
      if (success) return element;
    }
    return null;
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage === null) return;
    const onload = function () {
      imageElement
        .then((element) => {
          setImageSize({
            width: remToPixels(defaultWidthinRem),
            height:
              (element.height / element.width) * remToPixels(defaultWidthinRem),
          });
          setImage(element);
          imageRef.current = element;
        })
        .catch((e) => {
          console.error(e);
        });
    };
    imageElement
      .then((element) => {
        element.addEventListener('load', onload);
        return () => {
          element.removeEventListener('load', onload);
        };
      })
      .catch((e) => {
        console.error(e);
      });
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
          e.preventDefault();
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

  const stageRef = useRef(null);
  const handleWheel = (e) => {
    if (e.evt.ctrlKey === false) return;
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const zoomSpeed = 0.1;
    const pointer = stage.getPointerPosition();

    const mouseWheel = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = oldScale + mouseWheel * zoomSpeed;
    if (newScale<1 || newScale>10) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  }

  const dragBoundFunc = (pos) => {
    const frameWidth = imageSize.width;
    const frameHeight = imageSize.height;
    let newX = pos.x;
    let newY = pos.y;

    const stage = stageRef.current;
    const stageScale = stage.scaleX();

    // Adjust these values based on your actual stage and frame dimensions
    const stageWidth = stageScale * (image ? image.width : 0);
    const stageHeight = stageScale * (image ? image.height : 0);

    if (newX > 0) newX = 0;
    if (newY > 0) newY = 0;

    if (stageWidth > frameWidth) {
      if (newX < -(stageWidth - frameWidth)) newX = -(stageWidth - frameWidth);
    } else {
      newX = 0; // Prevent horizontal dragging if the image width is less than the frame width
    }

    if (stageHeight > frameHeight) {
      if (newY < -(stageHeight - frameHeight)) newY = -(stageHeight - frameHeight);
    } else {
      newY = 0; // Prevent vertical dragging if the image height is less than the frame height
    }

    return {
      x: newX,
      y: newY,
    };
  };

  useEffect(() => {
    const stage = stageRef.current;
    stage.on('wheel', handleWheel);
    return () => {
      stage.off('wheel', handleWheel);
    };
  }, []);

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
              ref={stageRef}
              draggable
              dragBoundFunc={dragBoundFunc}
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
