import { useLoaderData, redirect } from 'react-router';
import { Link } from "react-router";
import type { Route } from '../+types/root';
import { H1 } from '~/components/H1';
import { CircleCheck } from 'lucide-react';
import { Transition } from '@headlessui/react';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || 'unknown';
  const scoreParam = url.searchParams.get('score');
  const score = scoreParam ? parseFloat(scoreParam) : null;

  if (!from || (from !== 'evaluate')) {
    throw redirect('/');
  }

  return { from, score };
}

export default function Success() {
  const { from, score } = useLoaderData<typeof loader>();
  const fmtScore = (v: number | null) => (v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`);

  return (
    <Transition
      appear={true}
      show={true}
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg text-gray-700 dark:text-gray-300">
          <CircleCheck className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          
          {from === 'evaluate' && (
            <>
              <H1 className="text-emerald-600">Evaluation Saved!</H1>
              <p className="mb-6">Thank you for assessing this submission.</p>
              
              {score !== null && (
                <div className="mt-6">
                  <p className="text-lg mb-4">
                    Your Evaluation Result
                  </p>
                  <div className="relative w-full bg-gray-200 rounded-full h-6 mb-2">
                    <div
                      className="bg-emerald-600 h-6 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-600">{fmtScore(score)}</h2>
                </div>
              )}
            </>
          )}

          <div className="mt-8 space-x-4">
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Back Home
            </Link>
            {/* Optional: Add a link to view the project if you have the ID */}
            {/* <Link to={`/project/${submissionId}`} className="inline-block px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">
              View Project
            </Link> */}
          </div>
        </div>
      </div>
    </Transition>
  );
}