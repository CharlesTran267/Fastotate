'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, useMemo, use } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { relativeToOriginalCoords, remToPixels } from '../../utils/utils';
import {
  useAnnotationSessionStore,
  Annotation,
} from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';
import { getImage } from '@/stores/imageDatabase';
import { LoadingModal } from '../Modals/LoadingModal';

const PolygonAnnotation = dynamic(() => import('./PolygonAnnotation'), {
  ssr: false,
});

const MagicAnnotation = dynamic(() => import('./MagicAnnotation'), {
  ssr: false,
});

export default function Canvas() {
  const defaultWidthinRem = 50;

  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );
  const loading = useAnnotationSessionStore((state) => state.loading);

  const zoomLevel = useAnnotationSessionStore((state) => state.zoomLevel);
  const stagePos = useAnnotationSessionStore((state) => state.stagePos);

  const project = useAnnotationSessionStore((state) => state.project);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );

  const selectedImage = sessionActions.getSelectedImage();
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({});
  const [oriSize, setOriSize] = useState({});

  const [mousePos, setMousePos] = useState([0, 0]);
  const [mousePosOri, setMousePosOri] = useState([-1, -1]);

  const [currentAnnotation, setCurrentAnnotation] = useState(new Annotation());

  const [magicPoints, setMagicPoints] = useState([]);
  const [magicLabels, setMagicLabels] = useState([]);

  const imageElement = useMemo(async () => {
    if (typeof window !== 'undefined' && selectedImage != null) {
      const element = new window.Image();
      const newImage = await getImage(selectedImage.image_id);
      element.src = URL.createObjectURL(newImage);
      return element;
    }
    return null;
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage == null) return;
    const onload = function () {
      imageElement
        .then((element) => {
          setOriSize({
            width: element.width,
            height: element.height,
          });
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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (
        annotationMode === AnnotationMode.POLYGON ||
        annotationMode === AnnotationMode.RECTANGLE
      ) {
        if (e.key === 'Escape') {
          setCurrentAnnotation(new Annotation());
          setIsDrawingRect(false);
        } else if (e.key === ' ') {
          e.preventDefault();
          if (currentAnnotation.points.length > 2) {
            sessionActions.addAnnotation(
              currentAnnotation.points,
              project.default_class,
            );
            setCurrentAnnotation(new Annotation());
          }
        }
      } else if (annotationMode === AnnotationMode.MAGIC) {
        if (e.key === 'Escape') {
          setMagicPoints([]);
          setMagicLabels([]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentAnnotation]);

  useEffect(() => {
    if (annotationMode !== AnnotationMode.MAGIC) {
      setMagicPoints([]);
      setMagicLabels([]);
    }
    if (
      annotationMode !== AnnotationMode.POLYGON ||
      annotationMode !== AnnotationMode.RECTANGLE
    ) {
      setCurrentAnnotation(new Annotation());
    }
  }, [annotationMode]);

  useEffect(() => {
    setCurrentAnnotation(new Annotation());
    setMagicPoints([]);
    setMagicLabels([]);
  }, [selectedImageID]);

  const getMousePos = (stage) => {
    const scale = stage.scaleX();
    const stagePos = stage.position();
    const pos = stage.getPointerPosition();
    return [(pos.x - stagePos.x) / scale, (pos.y - stagePos.y) / scale];
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setMousePos(mousePos);
    const newMousePosOri = relativeToOriginalCoords(
      mousePos,
      imageSize,
      oriSize,
    );
    setMousePosOri(newMousePosOri);

    if (annotationMode === AnnotationMode.RECTANGLE && isDrawingRect) {
      const newPoints = [
        currentAnnotation.points[0],
        [currentAnnotation.points[0][0], mousePosOri[1]],
        mousePosOri,
        [mousePosOri[0], currentAnnotation.points[0][1]],
      ];
      setCurrentAnnotation({ ...currentAnnotation, points: newPoints });
    }
  };

  const [isDrawingRect, setIsDrawingRect] = useState(false);
  //drawing begins when mousedown event fires.
  const handleMouseDown = (e) => {
    //Check if ctrl key is pressed
    if (e.evt.ctrlKey) return;
    if (
      !(
        annotationMode === AnnotationMode.POLYGON ||
        annotationMode === AnnotationMode.RECTANGLE ||
        annotationMode === AnnotationMode.MAGIC
      )
    )
      return;

    if (annotationMode === AnnotationMode.MAGIC) {
      setMagicPoints([...magicPoints, mousePosOri]);
      if (e.evt.button === 2) {
        setMagicLabels([...magicLabels, 0]);
      } else if (e.evt.button === 0) {
        setMagicLabels([...magicLabels, 1]);
      }
    } else if (annotationMode === AnnotationMode.POLYGON) {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, mousePosOri],
      });
    } else {
      if (isDrawingRect) return;
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [mousePosOri, mousePosOri, mousePosOri, mousePosOri],
      });
      setIsDrawingRect(true);
    }
  };

  const handleMouseUp = (e) => {
    if (annotationMode === AnnotationMode.RECTANGLE && isDrawingRect) {
      setIsDrawingRect(false);
      if (currentAnnotation.points[0][0] === currentAnnotation.points[2][0]) {
        setCurrentAnnotation(new Annotation());
      } else {
        sessionActions.addAnnotation(
          currentAnnotation.points,
          project.default_class,
        );
        setCurrentAnnotation(new Annotation());
      }
    }
  };

  const stageRef = useRef(null);
  const handleWheel = (e) => {
    if (e.evt.ctrlKey === false) return;
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const zoomSpeed = 0.1;

    const mouseWheel = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = oldScale + mouseWheel * zoomSpeed;
    if (newScale < 1 || newScale > 10) return;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    sessionActions.setZoomLevel(newScale);
    stage.position(newPos);
    stage.scale({ x: newScale, y: newScale });
  };

  useEffect(() => {
    sessionActions.setZoomLevel(1);
    const stage = stageRef.current;
    if (stage == null) return;
    stage.position({ x: 0, y: 0 });
  }, [selectedImageID]);

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
      if (newY < -(stageHeight - frameHeight))
        newY = -(stageHeight - frameHeight);
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
    if (stage == null) return;
    stage.on('wheel', handleWheel);
    return () => {
      stage.off('wheel', handleWheel);
    };
  }, [stageRef.current]);

  const [isDraggable, setIsDraggable] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        setIsDraggable(true);
      }
    };
    const handleKeyUp = (e) => {
      if (!e.ctrlKey) {
        setIsDraggable(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex-1">
      <div className="flex flex-col items-center justify-center">
        {loading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : null}
        <LoadingModal
          modal_id="setting_image_modal"
          modal_title="Encoding Image"
          modal_message="This may take longer on the first try"
        />
        <div className="max-w-4xl">
          {selectedImage != null ? (
            <>
              <Stage
                id="canvas-stage"
                width={imageSize.width || 650}
                height={imageSize.height || 302}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                ref={stageRef}
                draggable={isDraggable}
                scaleX={zoomLevel}
                scaleY={zoomLevel}
                dragBoundFunc={dragBoundFunc}
              >
                <Layer
                  onContextMenu={(e) => {
                    e.evt.preventDefault();
                  }}
                >
                  <Image
                    ref={imageRef}
                    image={image}
                    x={0}
                    y={0}
                    width={imageSize.width}
                    height={imageSize.height}
                    onClick={() => sessionActions.setSelectedAnnotationID(null)}
                  />
                  {selectedImage.annotations.map((annotation) => {
                    return (
                      <PolygonAnnotation
                        key={annotation.annotation_id}
                        annotation={annotation}
                        mousePos={mousePos}
                        imageSize={imageSize}
                        oriSize={oriSize}
                        isFinished={true}
                        stage={stageRef.current}
                        rect={false}
                      />
                    );
                  })}
                  <PolygonAnnotation
                    annotation={currentAnnotation}
                    mousePos={mousePos}
                    imageSize={imageSize}
                    oriSize={oriSize}
                    isFinished={false}
                    stage={stageRef.current}
                    rect={isDrawingRect}
                  />
                  {annotationMode === AnnotationMode.MAGIC ? (
                    <MagicAnnotation
                      magicPoints={magicPoints}
                      magicLabels={magicLabels}
                      setMagicPoints={setMagicPoints}
                      setMagicLabels={setMagicLabels}
                      imageSize={imageSize}
                      oriSize={oriSize}
                    />
                  ) : null}
                </Layer>
              </Stage>
              <div className="float-end my-4">
                <p>
                  X: {Math.round(mousePosOri[0] * 100) / 100}, Y:{' '}
                  {Math.round(mousePosOri[1] * 100) / 100}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
