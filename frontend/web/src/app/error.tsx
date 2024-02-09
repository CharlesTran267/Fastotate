'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

type ErrorProps = {
  error: Error;
};

export default function ErrorPage({ error }: ErrorProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, [ref]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{error.message}</h3>
        <p className="py-4">You will be returned to the home page</p>
        <div className="modal-action">
          <form method="dialog">
            <Link className="btn btn-neutral" href="/">
              Return to Home
            </Link>
          </form>
        </div>
      </div>
    </dialog>
  );
}
