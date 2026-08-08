import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  withBackground?: boolean;
  fullScreen?: boolean; // Opcional: tela cheia
}

export function LoadingSpinner({
  text = 'Carregando...',
  withBackground = false,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const heightClass = fullScreen ? 'min-h-screen' : 'min-h-[60vh]';

  return (
    <div
      className={`${heightClass} flex flex-col items-center justify-center text-slate-400 
      ${withBackground ? 'bg-slate-950' : ''}`}
    >
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
      <p className="text-sm font-medium text-purple-300 uppercase tracking-wider">{text}</p>
    </div>
  );
}

interface LoadingMoreProps {
  text?: string;
}

export function LoadingMore({ text }: LoadingMoreProps) {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      {text && <span className="ml-2 text-slate-400">{text}</span>}
    </div>
  );
}
