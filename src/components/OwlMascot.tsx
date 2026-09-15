import React, { useState } from 'react';
import owlMascotImg from '../assets/images/mint_owl_mascot_1789511986381.jpg';

export type OwlMood = 'wise' | 'happy' | 'alert' | 'celebrate' | 'saving';

interface OwlMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mood?: OwlMood;
  className?: string;
  forceVector?: boolean;
}

export const OwlMascot: React.FC<OwlMascotProps> = ({
  size = 'md',
  mood = 'wise',
  className = '',
  forceVector = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-13 h-13',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (!forceVector && !imageError) {
    return (
      <div
        className={`inline-flex items-center justify-center select-none shrink-0 relative ${sizeClasses[size]} ${className}`}
        aria-label="Mascote Coruja Sábia"
      >
        <img
          src={owlMascotImg}
          alt="Coruja Mascote Finanças"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-2xl shadow-xs border border-emerald-200/70 hover:scale-105 transition-transform duration-300"
        />
        {mood === 'saving' && (
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-bold text-[9px] px-1 py-0.2 rounded-full border border-amber-200 shadow-2xs">
            R$
          </span>
        )}
        {mood === 'alert' && (
          <span className="absolute -top-1 -right-1 bg-rose-500 w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      aria-label="Mascote Coruja Sábia"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        {/* Owl Ear Tufts */}
        <polygon points="24,32 14,14 36,22" fill="#064e3b" />
        <polygon points="76,32 86,14 64,22" fill="#064e3b" />
        <polygon points="26,30 20,18 34,24" fill="#059669" />
        <polygon points="74,30 80,18 66,24" fill="#059669" />

        {/* Body */}
        <ellipse cx="50" cy="54" rx="36" ry="38" fill="#047857" />
        <ellipse cx="50" cy="58" rx="28" ry="30" fill="#10b981" />

        {/* Belly / Feathers pattern - soft cream */}
        <ellipse cx="50" cy="66" rx="20" ry="22" fill="#fefcf8" />
        {/* Feather arcs on chest */}
        <path d="M42 60 Q50 66 58 60" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M40 68 Q50 74 60 68" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M44 76 Q50 81 56 76" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Big Owl Eye Patches */}
        <circle cx="36" cy="38" r="15" fill="#fefcf8" stroke="#065f46" strokeWidth="2" />
        <circle cx="64" cy="38" r="15" fill="#fefcf8" stroke="#065f46" strokeWidth="2" />

        {/* Eyes based on mood */}
        {mood === 'celebrate' || mood === 'happy' ? (
          <>
            {/* Happy squint eyes ^ ^ */}
            <path d="M28 39 Q36 29 44 39" stroke="#064e3b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M56 39 Q64 29 72 39" stroke="#064e3b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'alert' ? (
          <>
            {/* Wide awake alert eyes with orange ring */}
            <circle cx="36" cy="38" r="10" fill="#f59e0b" />
            <circle cx="64" cy="38" r="10" fill="#f59e0b" />
            <circle cx="36" cy="38" r="5" fill="#064e3b" />
            <circle cx="64" cy="38" r="5" fill="#064e3b" />
            <circle cx="34" cy="36" r="2" fill="#ffffff" />
            <circle cx="62" cy="36" r="2" fill="#ffffff" />
          </>
        ) : (
          <>
            {/* Wise focused eyes */}
            <circle cx="36" cy="38" r="9" fill="#064e3b" />
            <circle cx="64" cy="38" r="9" fill="#064e3b" />
            {/* Pupil glints */}
            <circle cx="34" cy="35" r="3" fill="#ffffff" />
            <circle cx="62" cy="35" r="3" fill="#ffffff" />
            <circle cx="38" cy="40" r="1.5" fill="#a7f3d0" />
            <circle cx="66" cy="40" r="1.5" fill="#a7f3d0" />
          </>
        )}

        {/* Glasses (Academic & Wise) - gold tone */}
        <circle cx="36" cy="38" r="14" stroke="#d97706" strokeWidth="2.5" fill="none" />
        <circle cx="64" cy="38" r="14" stroke="#d97706" strokeWidth="2.5" fill="none" />
        <path d="M50 38 L50 38" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="38" x2="52" y2="38" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

        {/* Gold Beak */}
        <polygon points="46,43 54,43 50,52" fill="#f59e0b" />

        {/* Wings */}
        <path d="M14 48 Q10 65 24 76 Q20 62 20 48 Z" fill="#064e3b" />
        <path d="M86 48 Q90 65 76 76 Q80 62 80 48 Z" fill="#064e3b" />

        {/* Little Feet / Talons */}
        <ellipse cx="42" cy="90" rx="5" ry="3" fill="#f59e0b" />
        <ellipse cx="58" cy="90" rx="5" ry="3" fill="#f59e0b" />

        {/* Gold coin */}
        {mood === 'saving' && (
          <g transform="translate(68, 68) scale(0.35)">
            <circle cx="20" cy="20" r="18" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
            <text x="14" y="27" fontSize="20" fontWeight="bold" fill="#713f12">R$</text>
          </g>
        )}
      </svg>
    </div>
  );
};

interface OwlTipCardProps {
  message: string;
  title?: string;
  mood?: OwlMood;
  variant?: 'info' | 'warning' | 'success' | 'celebrate';
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const OwlTipCard: React.FC<OwlTipCardProps> = ({
  message,
  title = 'Dica da Coruja',
  mood = 'wise',
  variant = 'info',
  onDismiss,
  actionText,
  onAction,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-950',
    warning: 'bg-amber-50/90 border-amber-200/80 text-amber-950',
    success: 'bg-teal-50/90 border-teal-200/80 text-teal-950',
    celebrate: 'bg-emerald-100/70 border-emerald-300 text-emerald-950',
  };

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 shadow-xs flex items-start gap-3 transition-all ${variantStyles[variant]} ${className}`}
    >
      <div className="shrink-0 pt-0.5">
        <OwlMascot size="sm" mood={mood} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xs sm:text-sm font-bold tracking-tight text-emerald-950 flex items-center gap-1.5">
            <span>🦉</span> {title}
          </h4>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-emerald-700/60 hover:text-emerald-900 text-xs px-1.5 py-0.5 rounded transition"
              aria-label="Fechar dica"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">{message}</p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1"
          >
            {actionText} →
          </button>
        )}
      </div>
    </div>
  );
};
