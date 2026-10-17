import React, { Suspense, lazy, useState, useEffect } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [scene]);

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black/60 ${className ?? ''}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-neutral-700/60 bg-gradient-to-tr from-neutral-800 to-black animate-pulse" />
          <div className="absolute w-20 h-20 rounded-full border border-zinc-500/40" />
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-600 border-t-zinc-200 animate-spin" />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onError={() => setHasError(true)}
      />
    </Suspense>
  );
}
