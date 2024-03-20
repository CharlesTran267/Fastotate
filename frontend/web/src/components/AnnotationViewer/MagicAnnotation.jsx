import { Group, Line, Circle } from 'react-konva';
import { useEffect, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { originalToRelativeCoords } from '@/utils/utils';
import { AnnotationMode } from '@/types/AnnotationMode';

export default function MagicAnnotation(props) {
  const {
    magicPoints,
    magicLabels,
    setMagicPoints,
    setMagicLabels,
    imageSize,
    oriSize,
  } = props;
  const vertexRadius = 4;

  const [flattenPoints, setFlattenPoints] = useState([]);
  const [currentPointGroups, setCurrentPointGroups] = useState([]);

  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );
  const annotationMode = useAnnotationSessionStore(
    (state) => state.annotationMode,
  );
  const project = useAnnotationSessionStore((state) => state.project);

  const [loading, setLoading] = useState(false);

  const socketResponse = useAnnotationSessionStore((state) => state.response);
  useEffect(() => {
    if (socketResponse === null) return;
    if (socketResponse.event_name === 'set_magic_points') {
      const polyVertices = socketResponse.data;
      if (polyVertices == null) return;
      let newCurrentPointGroups = [];
      const newFlattenPoints = polyVertices.map((vers) => {
        newCurrentPointGroups.push(vers);
        return originalToRelativeCoords(vers, imageSize, oriSize).flat();
      });
      setFlattenPoints(newFlattenPoints);
      setCurrentPointGroups(newCurrentPointGroups);
    } else if (socketResponse.event_name === 'set_magic_image') {
      setLoading(false);
    }
  }, [socketResponse]);

  useEffect(() => {
    if (annotationMode !== AnnotationMode.MAGIC || magicPoints.length === 0) {
      setCurrentPointGroups([]);
      setFlattenPoints([]);
      return;
    }
    sessionActions.setMagicPoints(magicPoints, magicLabels);
  }, [magicPoints, magicLabels]);

  useEffect(() => {
    sessionActions.setMagicImage();
    setLoading(true);
  }, [selectedImageID]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (annotationMode === AnnotationMode.MAGIC) {
        if (e.key === ' ') {
          e.preventDefault();
          setCurrentPointGroups([]);
          setMagicPoints([]);
          setMagicLabels([]);
          let annotations = [];
          for (let i = 0; i < currentPointGroups.length; i++) {
            annotations.push({
              points: currentPointGroups[i],
              className: project.default_class,
            });
          }
          if (annotations.length > 0)
            sessionActions.addAnnotations(annotations);
        }
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [currentPointGroups]);

  useEffect(() => {
    const modal = document.getElementById('setting_image_modal');
    if (modal === null) return;
    if (loading) {
      modal.showModal();
    } else {
      // Close modal if it's open
      if (modal.open) {
        modal.close();
      }
    }
  }, [loading]);

  return (
    <>
      <Group name="magic">
        {flattenPoints.map((points, index) => (
          <Line
            key={index}
            points={points}
            fill="rgb(140,30,255,0.5)"
            closed={true}
          />
        ))}
        {originalToRelativeCoords(magicPoints, imageSize, oriSize).map(
          (point, index) => {
            const x = point[0] - vertexRadius / 2;
            const y = point[1] - vertexRadius / 2;
            return (
              <Circle
                key={index}
                x={x}
                y={y}
                radius={vertexRadius}
                fill={magicLabels[index] == 1 ? '#32f218' : '#f50f0f'}
              />
            );
          },
        )}
      </Group>
    </>
  );
}
