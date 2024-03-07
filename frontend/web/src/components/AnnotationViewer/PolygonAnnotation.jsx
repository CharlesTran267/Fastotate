import React, { useState, useEffect } from 'react';
import { Line, Circle, Group } from 'react-konva';
import {
  minMax,
  dragBoundFunc,
  relativeToOriginalCoords,
} from '../../utils/utils';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';
import { originalToRelativeCoords } from '../../utils/utils';

export default function PolygonAnnotation(props) {
  const { annotation, mousePos, imageSize, oriSize, isFinished } = props;

  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedAnnotationID = useAnnotationSessionStore(
    (state) => state.selectedAnnotationID,
  );
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );

  const selectedImage = sessionActions.getSelectedImage();

  const vertexRadius = 6;
  const [stage, setStage] = useState();
  const [flattenPoints, setFlattenPoints] = useState([]);

  const handleMouseOverPoint = (e) => {
    e.target.scale({ x: 1.5, y: 1.5 });
  };

  const handleMouseOutPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
  };

  const handleGroupMouseOver = (e) => {
    if (!isFinished) return;
    e.target.getStage().container().style.cursor = 'move';
    setStage(e.target.getStage());
  };

  const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default';
  };

  const [minMaxX, setMinMaxX] = useState([0, 0]); //min and max in x axis
  const [minMaxY, setMinMaxY] = useState([0, 0]); //min and max in y axis
  const handleGroupDragStart = (e) => {
    sessionActions.setSelectedAnnotationID(annotation.annotation_id);
    const relativePoints = originalToRelativeCoords(
      annotation.points,
      imageSize,
      oriSize,
    );
    let arrX = relativePoints.map((p) => p[0]);
    let arrY = relativePoints.map((p) => p[1]);
    setMinMaxX(minMax(arrX));
    setMinMaxY(minMax(arrY));
  };

  const groupDragBound = (pos) => {
    let { x, y } = pos;
    const sw = stage.width();
    const sh = stage.height();
    if (minMaxY[0] + y < 0) y = -1 * minMaxY[0];
    if (minMaxX[0] + x < 0) x = -1 * minMaxX[0];
    if (minMaxY[1] + y > sh) y = sh - minMaxY[1];
    if (minMaxX[1] + x > sw) x = sw - minMaxX[1];
    return { x, y };
  };

  const handleAnnotationClick = () => {
    if (annotationMode !== AnnotationMode.SELECT || !isFinished) return;
    sessionActions.setSelectedAnnotationID(annotation.annotation_id);
  };

  const handlePointDragEnd = (e, annotation_id) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    selectedImage.annotations.map((annotation) => {
      if (annotation.annotation_id === annotation_id) {
        annotation.points[index] = relativeToOriginalCoords(
          pos,
          imageSize,
          oriSize,
        );
        sessionActions.modifySelectedAnnotation(
          annotation.points,
          annotation.className,
          annotation_id,
        );
      }
    });
  };

  const handleGroupDragEnd = (e, annotation_id) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    if (e.target.name() === 'polygon') {
      selectedImage.annotations.map((annotation) => {
        if (annotation.annotation_id === annotation_id) {
          let result = [];
          const copyPoints = [...annotation.points];
          const newXY = relativeToOriginalCoords(
            [e.target.x(), e.target.y()],
            imageSize,
            oriSize,
          );
          copyPoints.map((point) => {
            result.push([point[0] + newXY[0], point[1] + newXY[1]]);
          });
          e.target.position({ x: 0, y: 0 });
          annotation.points = result;
          sessionActions.modifySelectedAnnotation(
            annotation.points,
            annotation.className,
            annotation_id,
          );
        }
      });
    }
  };

  const [relativePoints, setRelativePoints] = useState([]);

  useEffect(() => {
    if (annotation.points.length === 0) {
      setFlattenPoints([]);
      setRelativePoints([]);
      return;
    }
    let newRelativePoints = originalToRelativeCoords(
      annotation.points,
      imageSize,
      oriSize,
    );
    setRelativePoints(newRelativePoints);

    let newFlattenPoints = newRelativePoints.flat();
    if (!isFinished) {
      newFlattenPoints = newFlattenPoints.concat(mousePos);
      newFlattenPoints.push(newFlattenPoints[0], newFlattenPoints[1]);
    }
    setFlattenPoints(newFlattenPoints);
  }, [annotation.points, mousePos, imageSize, oriSize]);

  return (
    <Group
      name="polygon"
      draggable={isFinished && annotationMode === AnnotationMode.SELECT}
      onDragStart={handleGroupDragStart}
      onDragEnd={(e) => handleGroupDragEnd(e, annotation.annotation_id)}
      dragBoundFunc={groupDragBound}
      onMouseOver={handleGroupMouseOver}
      onMouseOut={handleGroupMouseOut}
    >
      <Line
        points={flattenPoints}
        stroke="#00F1FF"
        strokeWidth={
          selectedAnnotationID &&
          annotation.annotation_id === selectedAnnotationID
            ? 6
            : 3
        }
        closed={isFinished}
        fill="rgb(140,30,255,0.5)"
        onClick={handleAnnotationClick}
      />
      {relativePoints.map((point, index) => {
        const x = point[0] - vertexRadius / 2;
        const y = point[1] - vertexRadius / 2;
        return (
          <Circle
            key={index}
            x={x}
            y={y}
            radius={vertexRadius}
            fill="#FF019A"
            stroke="#00F1FF"
            strokeWidth={2}
            draggable={annotationMode === AnnotationMode.SELECT}
            onDragEnd={(e) => handlePointDragEnd(e, annotation.annotation_id)}
            dragBoundFunc={(pos) =>
              dragBoundFunc(stage.width(), stage.height(), vertexRadius, pos)
            }
            hitStrokeWidth={12}
            onMouseOver={handleMouseOverPoint}
            onMouseOut={handleMouseOutPoint}
            onClick={handleAnnotationClick}
          />
        );
      })}
    </Group>
  );
}
