import { XCircle} from 'lucide-react'

export function ErrorBanner({ msg, onDismiss }: { msg: string; onDismiss?: () => void }) {
  if (!msg) return null;
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 flex items-center justify-between text-sm text-red-700 dark:text-red-300">
      <span>{msg}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-200">
            <XCircle size={16} />
        </button>
      )}
    </div>
  );
}
