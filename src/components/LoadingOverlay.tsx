interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({
  fullScreen = true,
}: LoadingOverlayProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]'
    : 'flex items-center justify-center h-full';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <video
          src="/load_carregando.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-40 h-40 mx-auto mb-4"
        />
      </div>
    </div>
  );
}