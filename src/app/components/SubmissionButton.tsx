import { Link } from 'react-router'
import { useSiweAuth } from '~/lib/auth'

type Props = {
  mobile?: boolean
  onClick?: () => void
}

export function SubmissionButton({ mobile = false, onClick }: Props) {
  const { authenticated, role } = useSiweAuth()
  if (!authenticated) return null

  const className = mobile
    ? "px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium text-center"
    : "px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"

  return (
    <Link to="/submission" onClick={onClick} className={className}>
      Make Submission
    </Link>

  )
}
