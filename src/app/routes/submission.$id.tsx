import { useLoaderData, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { Route } from './+types/submission.$id';
import { api } from '~/lib/api';
import { Disclosure, Transition, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { StatementModal } from '~/components/StatementModal';
import { ChevronUpIcon } from 'lucide-react';
import { H1 } from "~/components/H1";
import { Back } from "~/components/Back";

/* ---------- loader (only id) ---------- */
export async function loader({ params }: Route.LoaderArgs) {
  return params.id;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Submission Details' }];
}

/* ---------- component ---------- */
export default function SubmissionPage() {
  const submissionId = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', text: '' });

  useEffect(() => {
    api.get<any>(`submissions/${submissionId}`)
      .then(setData)
      .catch(() => navigate('/')); // 404 → home
  }, [submissionId, navigate]);

  if (!data) return <p className="p-8">Loading submission…</p>;

  /* ---------- helpers ---------- */
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'N/A');
  const fmtScore = (v: number | null) => (v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Back />
      <H1>{data.project_name}</H1>
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-6 space-y-2 mb-6">
        <h1 className="text-2xl font-semibold"></h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div><p className="text-gray-500 dark:text-gray-400">Date completed</p><p>{fmtDate(data.date_completed)}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Category</p><p>{data.category.name}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Evaluations</p><p>{data.evaluation_count}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Last Evaluated</p><p>{fmtDate(data.last_evaluation_date)}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Funding Readiness</p><p>{fmtScore(data.score)}</p></div>
        </div>
      </div>

      {/* Answers Accordion */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Answers</h2>
        {data.answers.map((a: any, idx: number) => (
          <Disclosure key={idx} as="div" className="mb-2">
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {a.question.section}
                    </span>
                    {a.question.project_statement}
                  </span>
                  <ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-5 w-5 text-indigo-500`} />
                </DisclosureButton>
                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                  <DisclosurePanel className="whitespace-pre-wrap px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-300">
                    {a.answer}
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </div>

      {/* Modal for guidance */}
      <StatementModal open={modalOpen} setOpen={setModalOpen} title="Guidance">
        {modalContent.text}
      </StatementModal>
    </div>
  );
}
