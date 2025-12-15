import { Copy, CircleCheck } from 'lucide-react';
import { useState } from 'react';

export function Share({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset icon after 1.5s
    } catch (e) {
      alert('Copy failed – please copy manually.');
    }
  };

  return (
    <p className="text-sm inline-flex items-center gap-2 mb-5">
      {shareUrl}
      <button
        onClick={copy}
        className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
        title="Copy to clipboard"
      >
        {copied ? <CircleCheck width={18} className="text-emerald-600" /> : <Copy width={18} />}
      </button>
    </p>
  );
}
