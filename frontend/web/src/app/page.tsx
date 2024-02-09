import FileUploader from '../components/FileUploader';

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <div className="relative left-1/2 top-1/2 flex w-fit -translate-x-1/2 -translate-y-1/2 flex-col gap-2">
        <div className="hero rounded-lg p-8 px-12 text-base-100">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="m-6 text-6xl font-bold text-primary">Fastotate</h1>
              <h1 className="text-3xl font-bold text-neutral">
                Free and Fast Image Annotation Tool
              </h1>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-[600px] flex-col gap-2 transition-all">
          <FileUploader />
        </div>
      </div>
    </main>
  );
}
