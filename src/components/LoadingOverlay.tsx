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
      <div className="flex flex-col items-center justify-center">
        <video
          src="/load_carregando.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-75 h-75 object-contain"
          style={{ maxWidth: '90vw', maxHeight: '90vh' }}

        />
      </div>
    </div>
  );
}