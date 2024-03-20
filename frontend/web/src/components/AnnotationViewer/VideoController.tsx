import { FaCirclePlay } from 'react-icons/fa6';
import { FaPauseCircle } from 'react-icons/fa';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function VideoController() {
  const [playing, setPlaying] = useState(false);
  const frameNumber = useAnnotationSessionStore((state) => state.frameNumber);
  const selectedVideoID = useAnnotationSessionStore(
    (state) => state.selectedVideoID,
  );
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedVideo = sessionActions.getSelectedVideo();

  const handleTogglePlay = () => {
    setPlaying(!playing);
  };

  const handleNext = () => {
    if (frameNumber !== null) {
      sessionActions.setFrameNumber(frameNumber + 1);
    }
  };

  const handlePrevious = () => {
    if (frameNumber !== null) {
      sessionActions.setFrameNumber(frameNumber - 1);
    }
  };

  useEffect(() => {
    if (selectedVideoID !== null && frameNumber !== null) {
      sessionActions.setSelectedImageID(
        selectedVideo!.videoFrames[frameNumber].image_id,
      );
    }
  }, [frameNumber, selectedVideoID]);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        if (
          frameNumber !== null &&
          frameNumber < selectedVideo!.videoFrames.length - 1
        ) {
          sessionActions.setFrameNumber(frameNumber + 1);
        } else {
          setPlaying(false);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [playing, frameNumber]);

  return (
    <div className="relative flex justify-center">
      <button
        className="btn btn-ghost m-2"
        onClick={handlePrevious}
        disabled={playing}
      >
        <MdSkipPrevious size={30} />
      </button>
      <button className="btn btn-ghost m-2" onClick={handleTogglePlay}>
        {playing ? <FaPauseCircle size={30} /> : <FaCirclePlay size={30} />}
      </button>
      <button
        className="btn btn-ghost m-2"
        onClick={handleNext}
        disabled={playing}
      >
        <MdSkipNext size={30} />
      </button>
      <p className="absolute right-0 top-1/2 -translate-y-1/2">
        {frameNumber !== null ? frameNumber + 1 : 0} /{' '}
        {selectedVideo?.videoFrames.length}
      </p>
    </div>
  );
}
