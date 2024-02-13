import {
  ImageAnnotation,
  useAnnotationSessionStore,
} from '@/stores/useAnnotationSessionStore';

export default function ImageTable() {
  const project = useAnnotationSessionStore((state) => state.project);
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const selectedImageID = useAnnotationSessionStore(
    (state) => state.selectedImageID,
  );

  return (
    <table className="table table-pin-rows table-pin-cols text-base-100">
      <thead className="font-black">
        <tr>
          <th className="w-3/5">File Name </th>
          <th className="w-2/5 p-1">Annotations</th>
        </tr>
      </thead>
      <tbody>
        {project.images.map((image: ImageAnnotation) => (
          <tr
            className="bg-neutral hover:cursor-pointer hover:bg-slate-500"
            key={image.id}
            onClick={() => sessionActions.setSelectedImage(image)}
          >
            <td
              className="h-10 whitespace-nowrap"
              style={
                image.id === selectedImageID
                  ? { backgroundColor: 'slateblue' }
                  : {}
              }
            >
              {image.file_name}
            </td>
            <th className="bg-neutral text-center">
              {image.annotations.length}
            </th>
          </tr>
        ))}
        {project.images.length < 10
          ? [...Array(10 - project.images.length)].map((_, i) => (
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
