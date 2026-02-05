import { useEffect, useRef } from "react";

interface RefreshButtonProps {
  isLoading: boolean;
  onClick: () => void;
  videoSrc: string;
  className?: string;
}

export function RefreshButton({ isLoading, onClick, videoSrc, className = "w-8 h-8" }: RefreshButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isLoading) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isLoading]);
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`${className} !outline-none focus:ring-0 flex items-center justify-center !bg-transparent !p-0 !border-0  transition-transform disabled:cursor-not-allowed`}
      title="Atualizar preço"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        className="w-full h-full object-contain"
      />
    </button>
  );
}