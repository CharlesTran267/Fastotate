'use client';
import FileUploader from '../components/FileUploader';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function Home() {
  const loading = useAnnotationSessionStore((state) => state.loading);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {loading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : (
        <>
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <h1 className="m-6 text-6xl font-bold text-primary">Fastotate</h1>
            <h1 className="text-3xl font-bold text-neutral">
              Free and Fast Image Annotation Tool
            </h1>
          </div>
          <div className="mx-auto my-3 flex w-[600px] flex-col gap-2 transition-all">
            <FileUploader />
          </div>
        </>
      )}
    </div>
  );
}
