import { useLoaderData, useNavigate } from 'react-router';
import { Fragment, useState, useEffect } from 'react';
import type { Route } from './+types/evaluate.$id';
import { api } from '~/lib/api';
import type { Submission, Question } from '~/lib/types';
import { StatementModal } from '~/components/StatementModal';
import { Info, ChevronUpIcon, CircleChevronRight } from 'lucide-react';
import { H1 } from "~/components/H1";
import { Transition, TransitionChild, Disclosure, DisclosurePanel, DisclosureButton } from '@headlessui/react';
import { Icon } from "~/components/Icons"
import Markdown from "react-markdown";
import { Back } from "~/components/Back";

/* ---------- loader ---------- */
export async function loader({ params }: Route.LoaderArgs) {
  // only questions – always fast
  const questions = await api.get<Question[]>('questions');
  return { questions, submissionId: params.id }; // pass id only
}

/* ---------- meta ---------- */
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Evaluate Submission' }];
}

/* ---------- component ---------- */
export default function Evaluate() {
  const { questions, submissionId } = useLoaderData<typeof loader>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [step, setStep] = useState(0);
  const [assessments, setAssessments] = useState<Record<number, 'agree' | 'disagree' | 'neither'>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Submission>(`submissions/${submissionId}`)
      .then((s) => {
        // order answers same as before
        const ordered = s.answers.sort(
          (a, b) =>
            questions.findIndex((q) => q.id === a.question_id) -
            questions.findIndex((q) => q.id === b.question_id)
        );
        setSubmission({ ...s, answers: ordered });
      })
      .catch(() => navigate('/')); // 404 → home
  }, [submissionId, questions, navigate]);

  if (!submission) return <p className="p-8">Loading submission…</p>;

  const total = submission.answers.length;

  const current = submission.answers[step];
  const q = questions.find((qq) => qq.id === current.question_id)!;

  const pct = Math.round((Object.keys(assessments).length / total) * 100);

  const next = () => step < total - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const allDone = Object.keys(assessments).length === total;

const handleSubmit = async () => {
  setSubmitting(true);
  const codeMap = { agree: '1', disagree: '2', neither: '3' } as const;

  const payload = {
    evaluator: 'anonymous',
    submission_id: submission.id,
    answers: submission.answers.map((a, idx) => ({
      question_id: a.question_id,
      answer: codeMap[assessments[idx]],
    })),
  };
  try {
    await api.post('/evaluation', payload);
    navigate('/success?from=evaluate');
  } catch (error) {
            alert('Error submitting your evaluation. Please try again.');
            setSubmitting(false);
        }
};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!submission && <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded" />}
      <Back />
      <H1>Evaluate Submission</H1>
      <div className='mb-8'>
        <p className='mb-3 inline-flex gap-2'>
              <CircleChevronRight />You will be asked to agree, disagree, or neither with a series of statements relating to the project's submission.</p>
          <p className='mb-3 inline-flex gap-2'>
              <CircleChevronRight />As much as possible, base your decisions on the answers provided.</p>
          <p className='mb-3 inline-flex gap-2'>
              <CircleChevronRight />The project's Karma details are available via the Project Details tab on the right.</p>
      </div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{Object.keys(assessments).length} / {total} assessed</span>
          <span>{pct} %</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Section header */}
      

      {/* Card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-6 space-y-6">
        <h2 className="text-xl font-semibold">{q.section}</h2>
        <div className="space-y-6">
            <div className="space-y-2">
                <div>
                    <label className="font-medium text-gray-800 dark:text-gray-200">Project's Answer</label>
                </div>
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-400 text-md">
                    {current.answer}
                </p>
            </div>

            <div className="space-y-2 border-t border-gray-800 dark:border-gray-600 pt-4">
                <div className="flex items-start justify-between">
                    <label className="font-medium text-gray-800 dark:text-gray-200">Your Decision</label>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                        <Info />
                    </button>
                </div>
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-400 text-md">
                    { q.evaluator_statement }
                </p>
            </div>

            {/* Assessment buttons */}
            <div className="flex items-center gap-3">
            {(['agree', 'disagree', 'neither'] as const).map((opt) => (
                <button
                key={opt}
                onClick={() =>
                    setAssessments({ ...assessments, [step]: opt })
                }
                className={`
                    px-4 py-2 rounded-lg font-medium transition
                    ${
                    assessments[step] === opt
                        ? opt === 'agree'
                        ? 'bg-emerald-600 text-white'
                        : opt === 'disagree'
                        ? 'bg-red-600 text-white'
                        : 'bg-yellow-300 dark:bg-yellow-700 text-gray-800 dark:text-gray-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                `}
                >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-end gap-3 mt-6">
      {step !== 0 && (
        <button
          onClick={back}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Back
        </button>
      )}

        {step === total - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!allDone || submitting}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              allDone && !submitting
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending…
              </>
            ) : (
              'Submit Evaluation'
            )}
          </button>
        ) : (
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Next →
          </button>
        )}
      </div>

      {/* Modal */}
      <StatementModal
        open={modalOpen}
        setOpen={setModalOpen}
        title="Evaluator Context"
      >
        {q.evaluator_description}
      </StatementModal>
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2
                  px-3 py-5
                  bg-indigo-600 text-white
                  font-semibold text-sm
                  rounded-l-lg shadow-lg
                  hover:bg-indigo-700
                  transition-colors"
        style={{ writingMode: 'vertical-rl' }}
      >
        Project Details
      </button>

      {/* Overlay */}
      <Transition show={drawerOpen} as={Fragment}>
        <div className="fixed inset-0 z-40">
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          </TransitionChild>
        
          {/* Panel */}
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold">{submission.project_name}</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="mb-8">The following data is taken directly from Karma.</p>
                {/* Accordion */}
                <div className="">
                  {/* Links */}
                  <Disclosure defaultOpen>
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <span>Links</span>
                          <ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-5 w-5 text-indigo-500`} />
                        </DisclosureButton>
                        <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                          <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-300">
                            {submission.karma_data?.project_details?.links?.filter((l: any) => l.url).length ? (
                              <div className="flex items-center gap-3">
                                {submission.karma_data.project_details.links
                                  .filter((l: any) => l.url) // hide empty / null
                                  .map((l: any) => (
                                    <a
                                      key={l.type}
                                      href={l.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                      title={l.type}
                                    >
                                      {Icon[l.type.toLowerCase()] ?? l.type}
                                    </a>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No links</p>
                            )}
                          </DisclosurePanel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>

                  {/* Description */}
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 mt-2">
                          <span>Description</span>
                          <ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-5 w-5 text-indigo-500`} />
                        </DisclosureButton>
                        <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                          <DisclosurePanel className="px-4 pt-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
                            <div className="prose dark:prose-invert max-w-none">
                              <Markdown>{submission.karma_data?.project_details?.description || 'No description'}</Markdown>
                            </div>
                          </DisclosurePanel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>

                  {/* Updates */}
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 mt-2">
                          <span>Updates</span>
                          <ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-5 w-5 text-indigo-500`} />
                        </DisclosureButton>
                        <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                          <DisclosurePanel className="px-4 pt-2 pb-2 text-sm text-gray-700 dark:text-gray-300 space-y-3">
                            {submission.karma_data?.updates?.length ? (
                              submission.karma_data.updates.map((u: any) => (
                                <div key={u.date}>
                                  <p className="font-medium">{u.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(u.date).toLocaleDateString()}</p>
                                  <p className="mt-1">{u.description}</p>
                                </div>
                              ))
                            ) : (
                              <p>No updates</p>
                            )}
                          </DisclosurePanel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                </div>
              </div>

              {/* Footer (optional) */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Transition>

    </div>
  );
}
