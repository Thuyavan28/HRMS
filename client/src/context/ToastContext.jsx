import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast('success', message, duration), [addToast]);
  const error = useCallback((message, duration) => addToast('error', message, duration), [addToast]);
  const info = useCallback((message, duration) => addToast('info', message, duration), [addToast]);
  const warning = useCallback((message, duration) => addToast('warning', message, duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bg = 'bg-dark-800 border-dark-600 text-slate-100';
          let icon = <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-dark-800 border-teal-500/40 text-slate-100 shadow-glow-teal-sm';
            icon = <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-dark-800 border-rose-500/40 text-slate-100';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-dark-800 border-amber-500/40 text-slate-100';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-dark-400 hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
