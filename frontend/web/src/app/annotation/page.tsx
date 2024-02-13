'use client';
import AnnotationSideBar from '@/components/AnnotationPage/AnnotationSideBar';
import ProjectSideBar from '@/components/AnnotationPage/ProjectSideBar/ProjectSideBar';
import Canvas from '@/components/AnnotationViewer/Canvas';
import { useEffect, useState } from 'react';

export default function AnnotationPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      {isHydrated ? (
        <div className="flex flex-1 items-center">
          <AnnotationSideBar />
          <Canvas />
          <ProjectSideBar />
        </div>
      ) : null}
    </>
  );
}
