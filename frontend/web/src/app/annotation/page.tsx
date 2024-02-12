import AnnotationSideBar from '@/components/AnnotationPage/AnnotationSideBar';
import ProjectSideBar from '@/components/AnnotationPage/ProjectSideBar';
import Canvas from '@/components/AnnotationPage/Canvas';

export default function AnnotationPage() {
  return (
    <div className="flex flex-1 items-center">
      <AnnotationSideBar />
      <Canvas />
      <ProjectSideBar />
    </div>
  );
}
