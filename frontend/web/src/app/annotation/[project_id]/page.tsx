'use client';
import AnnotationSideBar from '@/components/AnnotationPage/AnnotationSideBar';
import ProjectSideBar from '@/components/AnnotationPage/ProjectSideBar/ProjectSideBar';
import Canvas from '@/components/AnnotationViewer/Canvas';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAnnotationSessionStore } from '@/stores/useAnnotationSessionStore';

export default function AnnotationPage() {
  const projectId = useParams().project_id as string;
  const sessionActions = useAnnotationSessionStore((state) => state.actions);

  useEffect(() => {
    sessionActions.updateProject(projectId);
  }, [projectId]);

  return (
    <div className="flex flex-1 items-center">
      <AnnotationSideBar />
      <Canvas />
      <ProjectSideBar />
    </div>
  );
}
