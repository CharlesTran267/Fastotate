'use client';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';
import { useUserSessionStore } from '@/stores/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { createProject } from '@/utils/utils';

export default function FileUploader() {
  const sessionActions = useAnnotationSessionStore((state) => state.actions);
  const session_token = useUserSessionStore((state) => state.session_token);

  const router = useRouter();
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files) {
      const project_id = await createProject(session_token);
      if (!project_id) return;
      for (let i = 0; i < files.length; i++) {
        await sessionActions.uploadImage(files[i], project_id!);
      }
      router.push(`/annotation/${project_id}`);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <label
        htmlFor="dropzone-file"
        className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG, GIF, WEBP, etc.
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
        />
      </label>
    </div>
  );
}
