import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function ImageTable() {
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );
  const selectedVideoID = useAnnotationSessionStore(
    (state) => state.selectedVideoID,
  );

  const project = useAnnotationSessionStore((state) => state.project);

  return (
    <table className="table table-pin-rows table-pin-cols text-base-100">
      <thead className="font-black">
        <tr>
          <th className="w-3/5">File Name</th>
          <th className="w-2/5 p-1">Annotations</th>
        </tr>
      </thead>
      <tbody>
        {project?.imageAnnotations.map((image) => (
          <tr
            className="bg-neutral hover:cursor-pointer hover:bg-slate-500"
            key={image.image_id}
            onClick={() => {
              sessionActions.setSelectedImageID(image.image_id);
              sessionActions.setSelectedVideoID(null);
            }}
          >
            <td
              className="h-10 whitespace-nowrap"
              style={
                image.image_id === selectedImageID
                  ? { backgroundColor: 'slateblue' }
                  : {}
              }
            >
              {image.file_name}
            </td>
            <th className="bg-neutral text-center">
              {image.annotations ? image.annotations.length : 0}
            </th>
          </tr>
        ))}
        {project?.videoAnnotations.map((video) => (
          <tr
            className="bg-neutral hover:cursor-pointer hover:bg-slate-500"
            key={video.video_id}
            onClick={() => {
              sessionActions.setSelectedVideoID(video.video_id);
              sessionActions.setSelectedImageID(video.videoFrames[0].image_id);
              sessionActions.setFrameNumber(0);
            }}
          >
            <td
              className="h-10 whitespace-nowrap"
              style={
                video.video_id === selectedVideoID
                  ? { backgroundColor: 'slateblue' }
                  : {}
              }
            >
              {video.file_name}
            </td>
            <th className="bg-neutral text-center">
              {video.getTotalAnnotations()}
            </th>
          </tr>
        ))}

        {project &&
        project.imageAnnotations.length + project.videoAnnotations.length < 13
          ? [
              ...Array(
                13 -
                  (project.imageAnnotations.length +
                    project.videoAnnotations.length),
              ),
            ].map((_, i) => (
              <tr className="bg-neutral hover:bg-slate-500" key={i}>
                <td className="h-10 whitespace-nowrap"></td>
                <th className="bg-neutral text-center"></th>
              </tr>
            ))
          : null}
      </tbody>
    </table>
  );
}
