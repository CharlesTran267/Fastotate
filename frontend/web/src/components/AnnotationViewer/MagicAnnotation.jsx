import { Group, Line, Circle } from 'react-konva';
import { useEffect, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { socket } from '@/utils/socket';

export default function MagicAnnotation(props) {
  const { magicPoints, magicLabels, mousePos } = props;
  const vertexRadius = 4;

  const [flattenPoints, setFlattenPoints] = useState([]);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );
  const [mask, setMask] = useState(null);
  const [loading, setLoading] = useState(false);

  socket.on('set_magic_points', (resp) => {
    setMask(resp.data);
  });

  socket.on('set_magic_image', (resp) => {
    console.log(resp);
    setLoading(false);
  });

  useEffect(() => {
    console.log(mask);
  }, [mask]);

  useEffect(() => {
    sessionActions.setMagicPoints(magicPoints, magicLabels);
  }, [magicPoints, magicLabels]);

  useEffect(() => {
    console.log('reach here');
    sessionActions.setMagicImage(selectedImageID);
    setLoading(true);
  }, [selectedImageID]);

  useEffect(() => {
    if (loading) {
      document.getElementById('loading_modal').showModal();
    } else {
      document.getElementById('loading_modal').close();
    }
  }, [loading]);

  return (
    <>
      <dialog id="loading_modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Loading...</h3>
          <p className="py-4">Please wait, your request is being processed.</p>
          <div className="modal-action">
            {/* You can add actions or additional content here */}
          </div>
        </div>
      </dialog>
      <Group name="magic">
        <Line
          points={flattenPoints}
          strokeWidth={0}
          fill="rgba(0, 0, 0, 0.5)"
        />
        {magicPoints.map((point, index) => {
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
        })}
      </Group>
    </>
  );
}
