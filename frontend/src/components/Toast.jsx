import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
      >
        {toasts.map((toast) => {
          let bg = 'bg-white border-[#E4E7EC] text-[#1F2933]';
          let Icon = CheckCircle2;
          let iconColor = 'text-[#487A5E]';

          if (toast.type === 'error') {
            bg = 'bg-[#FDF2F2] border-[#F8D7DA] text-[#7A271A]';
            Icon = AlertCircle;
            iconColor = 'text-[#B85C5C]';
          } else if (toast.type === 'warning') {
            bg = 'bg-[#FEF9EE] border-[#F9ECCB] text-[#7A4D05]';
            Icon = AlertTriangle;
            iconColor = 'text-[#C49A4A]';
          } else if (toast.type === 'info') {
            bg = 'bg-[#F0F5F8] border-[#D7E6EE] text-[#183B56]';
            Icon = Info;
            iconColor = 'text-[#2F6F8F]';
          } else {
            bg = 'bg-[#F2F8F4] border-[#D8EADB] text-[#1A4B30]';
            Icon = CheckCircle2;
            iconColor = 'text-[#487A5E]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
              role="alert"
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#667085] hover:text-[#1F2933] p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}
