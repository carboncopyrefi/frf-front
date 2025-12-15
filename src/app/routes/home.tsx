import { useLoaderData, Form, useSearchParams, Link } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/home';
import { api } from '~/lib/api';
import type { CategoryPayload } from '~/lib/types';

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

  /* ------------ derive state from URL (search + sort) ------------- */
  const search = searchParams.get('q') ?? '';
  const sort   = searchParams.get('sort') ?? 'score_desc';

  /* -------------------------- filtering ---------------------------- */
  const filtered = data.submissions.filter((s) => {
    if (filter === 'evaluated') return s.evaluation_count > 0;
    if (filter === 'awaiting') return s.evaluation_count === 0;
    return true; // all
  });

  const searched =filtered.filter((s) =>
    s.project_name.toLowerCase().includes(search.toLowerCase())
  );

  /* --------------------------- sorting ----------------------------- */
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'date_desc':
        return new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime();
      case 'date_asc':
        return new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime();
      case 'score_desc':
        return (b.score ?? 0) - (a.score ?? 0);
      case 'score_asc':
        return (a.score ?? 0) - (b.score ?? 0);
      default:
        return 0;
    }
  });

  /* --------------------- tiny helpers ------------------------------ */
  const formatScore = (v: number | null) =>
    v === null || v === 0 ? 'Awaiting Evaluation' : `${(v * 100).toFixed(1)}%`;

  const cycleSort = () => {
    const order: Array<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'> =
      ['date_desc', 'date_asc', 'score_desc', 'score_asc'];
    const next = order[(order.indexOf(sort as any) + 1) % order.length];
    setSearchParams({ q: search, sort: next });
  };

  return (
    <>
      {/* Stats cards */}
      <section className="hidden md:grid md:grid-cols-3 md:gap-4 md:mt-6">
        <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Submissions</p>
          <p className="text-2xl font-semibold">{data.submissions.length}</p>
        </article>
        <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Funding Readiness</p>
          <p className="text-2xl font-semibold">
            {formatScore(
              data.submissions.length
                ? data.submissions.reduce((a, b) => a + (b.score ?? 0), 0) / data.submissions.length
                : 0
            )}
          </p>
        </article>
        <article className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
          <p className="text-2xl font-semibold text-wrap-balance">{data.name}</p>
        </article>
      </section>

      {/* Table */}
      <section className="@container">
        <div className="md:rounded-2xl md:bg-white md:dark:bg-gray-900 md:shadow-sm md:dark:shadow-none md:inset-shadow-sm md:dark:inset-shadow-gray-800 overflow-hidden mt-6">
          {/* toolbar: search + sort */}
          <div className="md:px-4 py-5 md:border-b md:border-gray-200 md:dark:border-gray-800 flex items-center justify-between">
            <Form method="get" className="flex items-center gap-2">
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
            <div className="flex flex-wrap items-center gap-2">
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

            {/* <button
              onClick={cycleSort}
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Sort: <span className="font-semibold">{sort.replace('_', ' ')}</span>
            </button> */}
          </div>
          
          {sorted.length ? (
            <>
              {sorted.map((s) => (
                <div key={s.id ?? `${s.project_id}-${s.date_completed}`} className="lg:hidden mb-4">
                  <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{s.project_name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.date_completed).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><p className="text-gray-500 dark:text-gray-400">Evaluations</p><p>{s.evaluation_count}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400">Last Evaluation</p><p>{s.last_evaluation_date ? new Date(s.last_evaluation_date).toLocaleDateString() : 'N/A'}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400">Score</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${(s.score ?? 0) >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : (s.score ?? 0) >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {formatScore(s.score)}
                      </span></div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <Link to={`/evaluate/${s.id}`} className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">Evaluate</Link>
                        <Link to={`/projects/${s.project_name.toLowerCase().replace(" ", "-")}`} className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium">View</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <table className="hidden lg:table w-full text-sm">
                <thead className="bg-gray-100/50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Project</th>
                    <th className="px-4 py-3 text-left font-semibold">Date Completed</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Evaluation Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Evaluations</th>
                    <th className="px-4 py-3 text-left font-semibold">Funding Readiness</th>
                    <th className="px-4 py-3 text-left font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">     
                    {sorted.map((s) => (
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
                          <span
                            className={`
                              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${
                                (s.score ?? 0) >= 0.8
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : (s.score ?? 0) >= 0.5
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }
                            `}
                          >
                            {formatScore(s.score)}
                          </span>
                        </td>
                        <td className='text-right pe-4 py-3'>
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/evaluate/${s.id}`}
                              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                            >
                              Evaluate
                            </Link>
                            <Link
                              to={`/projects/${s.project_name.toLowerCase().replace(" ", "-")}`}
                              className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>  
            </>
          ) : (
            <div className="py-5 px-5 text-center text-sm">No submissions {filter !== 'all' && `for “${filter}”`}</div>
          )}
          
        </div>
      </section>
    </>
  );
}
