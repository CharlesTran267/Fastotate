import React, { useState, useEffect } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { minMax, dragBoundFunc } from '../../utils/utils';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { AnnotationMode } from '@/types/AnnotationMode';
/**
 *
 * @param {minMaxX} props
 * minMaxX[0]=>minX
 * minMaxX[1]=>maxX
 *
 */

export default function PolygonAnnotation(props) {
  const {
    annotation,
    mousePos,
    setMouseOverPoint,
    handlePointDragMove,
    handleGroupDragEnd,
  } = props;

  const annotationMode = useAnnotationSessionStore((state) => state.annotationMode);

  const vertexRadius = 6;
  const [stage, setStage] = useState();
  const [flattenPoints, setFlattenPoints] = useState([]);

  const handleMouseOverPoint = (e) => {
    e.target.scale({ x: 1.5, y: 1.5 });
    setMouseOverPoint(true);
  };

  const handleMouseOutPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
    setMouseOverPoint(false);
  };

  const handleGroupMouseOver = (e) => {
    if (!annotation.isFinished) return;
    e.target.getStage().container().style.cursor = 'move';
    setStage(e.target.getStage());
  };

  const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default';
  };

  const [minMaxX, setMinMaxX] = useState([0, 0]); //min and max in x axis
  const [minMaxY, setMinMaxY] = useState([0, 0]); //min and max in y axis
  const handleGroupDragStart = (e) => {
    let arrX = annotation.points.map((p) => p[0]);
    let arrY = annotation.points.map((p) => p[1]);
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

  useEffect(() => {
    if (annotation.isFinished) {
      setFlattenPoints(annotation.points.flat());
    } else {
      setFlattenPoints(annotation.points.flat().concat(mousePos));
    }
  }, [annotation.points, annotation.isFinished, mousePos]);

  return (
    <Group
      name="polygon"
      draggable={annotation.isFinished && annotationMode === AnnotationMode.SELECT}
      onDragStart={handleGroupDragStart}
      onDragEnd={(e) => handleGroupDragEnd(e, annotation.id)}
      dragBoundFunc={groupDragBound}
      onMouseOver={handleGroupMouseOver}
      onMouseOut={handleGroupMouseOut}
    >
      <Line
        points={
          annotation.points[0] ? flattenPoints.concat(annotation.points[0]) : []
        }
        stroke="#00F1FF"
        strokeWidth={3}
        closed={annotation.isFinished}
        fill="rgb(140,30,255,0.5)"
      />
      {annotation.points.map((point, index) => {
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
            onDragMove={(e) => handlePointDragMove(e, annotation.id)}
            dragBoundFunc={(pos) =>
              dragBoundFunc(stage.width(), stage.height(), vertexRadius, pos)
            }
            hitStrokeWidth={12}
            onMouseOver={handleMouseOverPoint}
            onMouseOut={handleMouseOutPoint}
          />
        );
      })}
    </Group>
  );
}
