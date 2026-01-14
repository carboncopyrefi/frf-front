import { Link } from 'react-router'
import { useSiweAuth } from '~/lib/auth'
import { Plus } from 'lucide-react';

type Props = {
  mobile?: boolean
}

export function SubmissionButton({ mobile = false }: Props) {
  const { authenticated, role } = useSiweAuth()
  if (!authenticated) return null

  const className = mobile
    ? "md:hidden flex p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    : "hidden md:flex px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"

  return (
    <div>
      <Link to="/submission" className={className}>
        {mobile ? (
          <Plus size={24} />
        ) : (
          "Make Submission"
        )}
      </Link>
    </div>

  )
}
