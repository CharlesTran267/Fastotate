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
import { LoadingModal } from '../LoadingModal';

const RectangleAnnotation = dynamic(() => import('./RectangleAnnotation'), {
  ssr: false,
});

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
    return [stage.getPointerPosition().x, stage.getPointerPosition().y];
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
  };

  //drawing begins when mousedown event fires.
  const handleMouseDown = (e) => {
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
      return;
    }

    setCurrentAnnotation({
      ...currentAnnotation,
      points: [...currentAnnotation.points, mousePosOri],
    });
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
    if (newScale < 1 || newScale > 10) return;

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
  };

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

  const loading = useAnnotationSessionStore((state) => state.loading);

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
                width={imageSize.width || 650}
                height={imageSize.height || 302}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                ref={stageRef}
                draggable={false}
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
                      />
                    );
                  })}
                  <PolygonAnnotation
                    annotation={currentAnnotation}
                    mousePos={mousePos}
                    imageSize={imageSize}
                    oriSize={oriSize}
                    isFinished={false}
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
