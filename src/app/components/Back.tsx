import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react'

export function Back() {
  return (

    <div className="flex items-center gap-2 py-2">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className='w-4 h-4' />
          Home
        </Link>
    </div>

  );
}