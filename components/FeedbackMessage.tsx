// components/FeedbackMessage.tsx
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';
type AlignType = 'start' | 'center' | 'end';

interface FeedbackMessageProps {
  type: FeedbackType;
  message: string;
  className?: string;
  onDismiss?: () => void;
  align?: AlignType;
}

const variants = {
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    icon: AlertTriangle,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: Info,
  },
};

// Mapeamento de alinhamento
const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

export function FeedbackMessage({ 
  type, 
  message, 
  className = '', 
  onDismiss,
  align = 'center',
}: FeedbackMessageProps) {
  if (!message) return null;
  
  const variant = variants[type];
  const Icon = variant.icon;
  const alignClass = alignClasses[align];
  return (
    <div 
      className={`
        ${variant.bg} 
        ${variant.text} 
        ${variant.border}
        p-3 rounded-xl mb-6 text-xs border 
        flex ${alignClass} gap-2   // ← ALINHAMENTO DINÂMICO
        ${className}
      `}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="leading-relaxed flex-1">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-100 transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}