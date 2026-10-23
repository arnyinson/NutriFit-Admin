import { useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loadingText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Styled replacement for window.confirm (destructive actions such as delete).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Delete',
  loadingText = 'Deleting...',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 break-words">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

type NoticeDialogProps = {
  open: boolean;
  variant?: 'warning' | 'success';
  title: string;
  message: string;
  onClose: () => void;
};

// Styled replacement for window.alert (error / info messages).
export function NoticeDialog({ open, variant = 'warning', title, message, onClose }: NoticeDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            variant === 'success' ? 'bg-green-50' : 'bg-amber-50'
          }`}
        >
          {variant === 'success' ? (
            <CheckCircle2 size={24} className="text-green-500" />
          ) : (
            <AlertTriangle size={24} className="text-amber-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 break-words">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}