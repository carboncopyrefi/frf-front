import { useLoaderData, useNavigate, Link } from 'react-router';
import { useEffect, useState } from 'react';
import type { Route } from './+types/submission.$id';
import { api } from '~/lib/api';
import { Disclosure, Transition, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { StatementModal } from '~/components/StatementModal';
import { ChevronRightIcon, BadgeCheck } from 'lucide-react';
import { H1 } from "~/components/H1";
import { Back } from "~/components/Back";
import { Share } from "~/components/Share";
import { useSiweAuth } from '~/lib/auth'
import { useAppKitAccount } from '@reown/appkit/react';

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
  const { authenticated, role } = useSiweAuth()
  const { address } = useAppKitAccount()

  const [data, setData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', text: '' });

  useEffect(() => {
    api.get<any>(`submissions/${submissionId}`)
      .then(setData)
      .catch(() => navigate('/')); // 404 → home
  }, [submissionId, navigate]);

  if (!data) return <p className="p-8">Loading submission…</p>;

  const alreadyEvaluated = authenticated &&
    role === 'evaluator' &&
    address &&
    data.evaluations.some((e: any) => e.evaluator.toLowerCase() === address.toLowerCase())

  const hasEvaluatedThis = data.evaluations?.some((e: any) => e.evaluator?.toLowerCase() === address?.toLowerCase());
  const isOwner = data.owner?.toLowerCase() === address?.toLowerCase();
  const showEvaluateButton = authenticated && role === 'evaluator' && address && !hasEvaluatedThis && !isOwner;

  /* ---------- helpers ---------- */
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'N/A');
  const fmtScore = (v: number | null) => (v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`);

  const rootUrl = import.meta.env.VITE_ROOT_URL;
  const shareUrl= rootUrl + `/projects/${data.project_name.toLowerCase().replace(" ", "-")}`;

  const easscanUrl = import.meta.env.VITE_EASSCAN_URL;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Back />
      <H1 className='mb-0 flex flex-row items-center gap-2'>{data.project_name}</H1>
      <div className='flex sm:items-center sm:justify-between mb-5 flex-col sm:flex-row space-y-3 sm:space-y-0'>
        <Share shareUrl={shareUrl} />
        <div className="gap-2 flex flex-row">
          {showEvaluateButton && (
            <Link
              to={`/evaluate/${data.id}`}
              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
                Evaluate
            </Link>
          )}
          <Link
            to={`${easscanUrl + data.eas_uid}`}
            target="_blank"
            className="inline-block px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition"
          >
            View Attestation
          </Link>
        </div>
      </div>
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-6 space-y-2 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div><p className="text-gray-500 dark:text-gray-400">Date Completed</p><p>{fmtDate(data.date_completed)}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Category</p><p>{data.category.name}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Evaluations</p><p>{data.evaluation_count}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Last Evaluation</p><p>{fmtDate(data.last_evaluation_date)}</p></div>
          <div><p className="text-gray-500 dark:text-gray-400">Funding Readiness</p><p>{fmtScore(data.score)}</p></div>
        </div>
      </div>

      {/* Evaluations */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Evaluations</h2>
        {data.evaluations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting evaluations</p>
        ) : (
        data.evaluations.map((e: any) => (
          <div
            key={e.id}
            className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-3 sm:px-4 sm:py-4 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{fmtDate(e.date_completed)}</span>
            <span>{e.evaluator}</span>
            <span>{fmtScore(e.score)}</span>
            <span><Link to={`${easscanUrl + data.eas_uid}`} target="_blank"><BadgeCheck className='text-emerald-600' /></Link></span>
          </div>
        ))
      )}
      </div>

      {/* Answers Accordion */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4">
        <h2 className="text-lg font-semibold mb-4">Answers</h2>
        {data.answers.map((a: any, idx: number) => (
          <Disclosure key={idx} as="div" className="mb-2">
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-3 sm:px-4 sm:py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <span className="w-fit px-2 py-1 text-[12px] sm:text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {a.question.section}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{a.question.project_statement}</span>
                  </div>
                  <ChevronRightIcon className={`${open ? 'rotate-90' : ''} h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 shrink-0`} />
                </DisclosureButton>

                <Transition show={open} enter="transition ease-out duration-100" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-75" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <DisclosurePanel className="whitespace-pre-wrap px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 text-sm text-gray-700 dark:text-gray-300">
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
