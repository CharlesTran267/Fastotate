import { FaCirclePlay } from 'react-icons/fa6';
import { FaPauseCircle } from 'react-icons/fa';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { LoadingModal } from '../Modals/LoadingModal';

export default function VideoController() {
  const frameNumber = useAnnotationSessionStore((state) => state.frameNumber);
  const videoPlaying = useAnnotationSessionStore((state) => state.videoPlaying);
  const selectedVideoID = useAnnotationSessionStore(
    (state) => state.selectedVideoID,
  );
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedVideo = sessionActions.getSelectedVideo();

  const handleTogglePlay = () => {
    sessionActions.setVideoPlaying(!videoPlaying);
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

  const handleToggleKeyFrame = () => {
    if (frameNumber !== null) {
      sessionActions.setKeyFrame(
        frameNumber,
        !selectedVideo!.videoFrames[frameNumber].keyFrame,
      );
    }
  };

  const handleInterpolate = async () => {
    if (frameNumber !== null) {
      setInterpolating(true);
      await sessionActions.interpolateAnnotations();
      setInterpolating(false);
    }
  };

  const handleSliding = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedVideoID) {
      sessionActions.setFrameNumber(parseInt(e.target.value));
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
    if (videoPlaying) {
      const interval = setInterval(() => {
        if (
          frameNumber !== null &&
          frameNumber < selectedVideo!.videoFrames.length - 1
        ) {
          sessionActions.setFrameNumber(frameNumber + 1);
        } else {
          sessionActions.setVideoPlaying(false);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [videoPlaying, frameNumber]);

  const [interpolating, setInterpolating] = useState(false);
  useEffect(() => {
    const modal = document.getElementById(
      'interpolating_modal',
    ) as HTMLDialogElement;
    if (modal == null) return;
    if (interpolating) {
      modal.showModal();
    } else {
      if (modal.open) modal.close();
    }
  }, [interpolating]);

  return (
    <div>
      <div className="relative flex justify-center">
        <button
          className="btn btn-ghost m-2"
          onClick={handlePrevious}
          disabled={videoPlaying}
        >
          <MdSkipPrevious size={30} />
        </button>
        <button className="btn btn-ghost m-2" onClick={handleTogglePlay}>
          {videoPlaying ? (
            <FaPauseCircle size={30} />
          ) : (
            <FaCirclePlay size={30} />
          )}
        </button>
        <button
          className="btn btn-ghost m-2"
          onClick={handleNext}
          disabled={videoPlaying}
        >
          <MdSkipNext size={30} />
        </button>
        <div
          className="tooltip tooltip-left absolute left-0 top-1/2 -translate-y-1/2"
          data-tip="Key Frame"
        >
          <input
            type="checkbox"
            className="toggle toggle-error"
            checked={selectedVideo!.videoFrames[frameNumber!].keyFrame}
            onChange={handleToggleKeyFrame}
          />
        </div>
        <p className="absolute right-0 top-1/2 -translate-y-1/2">
          {frameNumber !== null ? frameNumber + 1 : 0} /{' '}
          {selectedVideo?.videoFrames.length}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={selectedVideo!.videoFrames.length - 1}
        value={frameNumber!}
        className="range"
        step={1}
        onChange={handleSliding}
      />
      <div className="flex w-full justify-between px-2 text-xs h-8">
        {selectedVideo!.videoFrames.map((frame) => (
          <span
            className={frame.keyFrame ? 'text-xl font-black text-primary' : ''}
          >
            |
          </span>
        ))}
      </div>
      <div className="m-2 flex w-full justify-center">
        <button className="btn btn-secondary p-1" onClick={handleInterpolate}>
          Interpolate
        </button>
      </div>
      <LoadingModal
        modal_id="interpolating_modal"
        modal_title="Interpolating Annotations"
        modal_message="Interpolating annotations between key frames"
      />
    </div>
  );
}
