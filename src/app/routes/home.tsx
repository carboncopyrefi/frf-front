import { useLoaderData, Form, useSearchParams, Link } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/home';
import { api } from '~/lib/api';
import type { CategoryPayload } from '~/lib/types';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';
import { useSiweAuth } from '~/lib/auth'
import { useAppKitAccount } from '@reown/appkit/react';
import { ScoreBadge } from '~/components/ScoreBadge';

/* ------------------------------------------------------------------ */
/* React-Router 7 loader                                              */
/* ------------------------------------------------------------------ */
export async function loader(): Promise<CategoryPayload> {
  const slug = import.meta.env.VITE_CATEGORY;
  if (!slug) throw new Error('VITE_CATEGORY is not defined in .env');
  return api.get<CategoryPayload>(`categories/${slug}`);
}

/* ------------------------------------------------------------------ */
/* Meta                                                               */
/* ------------------------------------------------------------------ */
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Funding Readiness Framework by CARBON Copy' },
    { name: 'description', content: 'Category submissions table' },
  ];
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<'all' | 'evaluated' | 'awaiting'>('all');
  const { authenticated, role } = useSiweAuth()
  const { address } = useAppKitAccount()

  /* ------------ derive state from URL (search + sort) ------------- */
  const search = searchParams.get('q') ?? '';

  /* -------------------------- filtering ---------------------------- */
  const filtered = data.submissions.filter((s) => {
    if (filter === 'evaluated') return s.evaluation_count > 0;
    if (filter === 'awaiting') return s.evaluation_count === 0;
    return true; // all
  });

  const searched =filtered.filter((s) =>
    s.project_name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  /* --------------------- tiny helpers ------------------------------ */
  const formatScore = (v: number | null) =>
    v === null || v === 0 ? 'Awaiting Evaluation' : `${(v * 100).toFixed(1)}%`;

  const scoredOnly = data.submissions.filter((s) => s.score !== null);
  const avg = scoredOnly.length
    ? scoredOnly.reduce((a, b) => a + b.score!, 0) / scoredOnly.length
    : 0;

  return (
    <>
      <div className="px-4">
        {/* Stats cards */}
        <section className="hidden md:grid md:grid-cols-3 md:gap-4 md:mt-6">
          <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Submissions</p>
            <p className="text-2xl font-semibold">{data.submissions.length}</p>
          </article>
          <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Funding Readiness</p>
            <p className="text-2xl font-semibold">
              {formatScore(avg)}
            </p>
          </article>
          <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ecosystem</p>
            <p className="text-2xl font-semibold text-wrap-balance">{data.name}</p>
          </article>
        </section>

        {/* Table */}
        <section className="@container">
          <div className="lg:rounded-2xl lg:bg-white lg:dark:bg-gray-900 lg:shadow-sm lg:dark:shadow-none lg:inset-shadow-sm lg:dark:inset-shadow-gray-800 overflow-hidden mt-6">
            {/* toolbar: search + sort */}
            <div className="lg:px-4 py-5 lg:border-b lg:border-gray-200 lg:dark:border-gray-800 flex flex-col sm:flex-row justify-between gap-4">
              <Form
                onSubmit={(e) => {
                  e.preventDefault(); // stop real submit
                  const q = new FormData(e.currentTarget).get('q') as string;
                  setSearchParams({ q });
                }}
                className="flex gap-2"
              >
                <input
                  name="q"
                  placeholder="Search by project"
                  defaultValue={search}
                  className="px-5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition cursor-pointer"
                  >
                  Search
                </button>
              </Form>
              <div className="md:hidden relative w-full">
                <Listbox value={filter} onChange={setFilter}>
                  <ListboxButton className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                    {filter === 'all' ? 'All' : filter === 'evaluated' ? 'Evaluated' : 'Awaiting'}
                    <ChevronDownIcon className="w-4 h-4 ml-2" />
                  </ListboxButton>
                  <ListboxOptions className="absolute z-20 mt-1 w-full rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
                    {(['all', 'evaluated', 'awaiting'] as const).map((f) => (
                      <ListboxOption key={f} value={f} className={({ active }) => `px-4 py-2 text-sm cursor-pointer ${active ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                        {f === 'all' ? 'All' : f === 'evaluated' ? 'Evaluated' : 'Need Evaluation'}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Listbox>
              </div>
              <div className="hidden md:flex flex-wrap items-center gap-2">
                {(['all', 'evaluated', 'awaiting'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                      filter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'evaluated' ? 'Evaluated' : 'Awaiting'}
                  </button>
                ))}
              </div>
            </div>
            
            {searched.length ? (
              <>
                <div className="lg:hidden md:grid md:grid-cols-2 md:gap-4">
                  {searched.map((s) => {
                    const hasEvaluatedThis = s.evaluations?.some((e: any) => e.evaluator?.toLowerCase() === address?.toLowerCase());
                    const isOwner = s.owner?.toLowerCase() === address?.toLowerCase();
                    const showEvaluateButton = authenticated && role === 'evaluator' && address && !hasEvaluatedThis && !isOwner;

                    return (
                      <div key={s.id ?? `${s.project_id}-${s.date_completed}`} className='mb-4'>
                        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4 space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{s.project_name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.date_completed).toLocaleDateString()}</span>
                          </div>

                          <div className="grid grid-cols-1 space-y-3 sm:space-y-0 sm:grid-cols-3 md:grid-cols-1 md:space-y-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Funding Readiness</p>
                              <ScoreBadge score={s.score} />
                            </div>
                            <div><p className="text-gray-500 dark:text-gray-400">Evaluations</p><p>{s.evaluation_count}</p></div>
                            <div><p className="text-gray-500 dark:text-gray-400">Last Evaluation</p><p>{s.last_evaluation_date ? new Date(s.last_evaluation_date).toLocaleDateString() : 'N/A'}</p></div>
                          </div>
                          <div className="gap-2 grid grid-cols-2">
                            {showEvaluateButton && (
                              <Link to={`/evaluate/${s.id}`} className="flex items-center justify-center w-full px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">
                                Evaluate
                              </Link>
                            )}
                            <Link to={`/projects/${s.project_name.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center justify-center w-full px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium">View</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <table className="hidden lg:table w-full text-sm">
                  <thead className="bg-gray-100/50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Project</th>
                      <th className="px-4 py-3 text-left font-semibold">Date Submitted</th>
                      <th className="px-4 py-3 text-left font-semibold">Last Evaluation Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Evaluations</th>
                      <th className="px-4 py-3 text-left font-semibold">Funding Readiness</th>
                      <th className="px-4 py-3 text-left font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">     
                      {searched.map((s) => {
                        const hasEvaluatedThis = s.evaluations?.some((e: any) => e.evaluator?.toLowerCase() === address?.toLowerCase());
                        const isOwner = s.owner?.toLowerCase() === address?.toLowerCase();
                        const showEvaluateButton = authenticated && role === 'evaluator' && address && !hasEvaluatedThis && !isOwner;
                        return (
                        <tr
                          key={s.id ?? `${s.project_id}-${s.date_completed}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{s.project_name}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {new Date(s.date_completed).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            { s.last_evaluation_date
                              ? new Date(s.last_evaluation_date).toLocaleDateString()
                              : 'N/A' }
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{s.evaluation_count}</td>
                          <td className="px-4 py-3">
                            <ScoreBadge score={s.score} />
                          </td>
                          <td className='text-right pe-4 py-3'>
                            <div className="inline-flex items-center gap-2">
                              {showEvaluateButton && (
                                <Link to={`/evaluate/${s.id}`} className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
                                  Evaluate
                                </Link>
                              )}
                              <Link
                                to={`/projects/${s.project_name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                        );
                    })}
                  </tbody>
                </table>  
              </>
            ) : (
              <div className="py-5 px-5 text-center text-sm">No submissions {filter !== 'all' && `for “${filter}”`}</div>
            )}
            
          </div>
        </section>
      </div>
    </>
  );
}
