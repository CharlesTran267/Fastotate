import React, { useState, useEffect } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { relativeToOriginalCoords } from '../../utils/utils';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';
import { originalToRelativeCoords } from '../../utils/utils';

export default function PolygonAnnotation(props) {
  const vertexRadius = 6;
  const { annotation, mousePos, imageSize, oriSize, isFinished, stage, rect } =
    props;

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

  const [flattenPoints, setFlattenPoints] = useState([]);
  const [relativePoints, setRelativePoints] = useState([]);

  const handleMouseOverPoint = (e) => {
    e.target.scale({ x: 1.5, y: 1.5 });
  };

  const handleMouseOutPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
  };

  const handleGroupMouseOver = (e) => {
    if (!isFinished) return;
    e.target.getStage().container().style.cursor = 'move';
  };

  const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default';
  };

  const handleAnnotationClick = () => {
    if (annotationMode !== AnnotationMode.SELECT || !isFinished) return;
    sessionActions.setSelectedAnnotationID(annotation.annotation_id);
  };

  const [minMaxX, setMinMaxX] = useState([0, 0]); //min and max in x axis
  const [minMaxY, setMinMaxY] = useState([0, 0]); //min and max in y axis

  const minMax = (points) => {
    return points.reduce((acc, val) => {
      acc[0] = acc[0] === undefined || val < acc[0] ? val : acc[0];
      acc[1] = acc[1] === undefined || val > acc[1] ? val : acc[1];
      return acc;
    }, []);
  };

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
    const stagePos = stage.position();

    const sw = stage.width();
    const sh = stage.height();
    if (minMaxY[0] + y - vertexRadius < stagePos.y)
      y = stagePos.y - minMaxY[0] + vertexRadius;
    if (minMaxX[0] + x - vertexRadius < stagePos.x)
      x = stagePos.x - minMaxX[0] + vertexRadius;
    if (minMaxY[1] + y + vertexRadius > sh + stagePos.y)
      y = sh + stagePos.y - minMaxY[1] - vertexRadius;
    if (minMaxX[1] + x + vertexRadius > sw + stagePos.x)
      x = sw + stagePos.x - minMaxX[1] - vertexRadius;
    return { x, y };
  };

  const handleGroupDragEnd = (e) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    const annotation_id = annotation.annotation_id;
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

  const pointDragMove = (e) => {
    let x = e.target.x();
    let y = e.target.y();

    const sw = stage.width();
    const sh = stage.height();

    if (x + vertexRadius > sw) x = sw - vertexRadius;
    if (x - vertexRadius < 0) x = vertexRadius;
    if (y + vertexRadius > sh) y = sh - vertexRadius;
    if (y - vertexRadius < 0) y = vertexRadius;
    e.target.position({ x: x, y: y });
  };

  const handlePointDragEnd = (e) => {
    const stage = e.target.getStage();
    const stagePos = stage.position();
    const scale = stage.scaleX();
    const index = e.target.index - 1;
    const pos = [
      (e.target._lastPos.x - stagePos.x) / scale,
      (e.target._lastPos.y - stagePos.y) / scale,
    ];

    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();

    const annotation_id = annotation.annotation_id;
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
      if (!rect) newFlattenPoints = newFlattenPoints.concat(mousePos);
      newFlattenPoints.push(newFlattenPoints[0], newFlattenPoints[1]);
    }
    setFlattenPoints(newFlattenPoints);
  }, [annotation.points, mousePos, imageSize, oriSize]);

  return (
    <Group
      name="polygon"
      draggable={isFinished && annotationMode === AnnotationMode.SELECT}
      onDragStart={handleGroupDragStart}
      onDragEnd={handleGroupDragEnd}
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
            onDragEnd={handlePointDragEnd}
            onDragMove={pointDragMove}
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
