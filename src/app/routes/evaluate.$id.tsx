import { useLoaderData, useNavigate, Navigate } from 'react-router';
import { Fragment, useState, useEffect, useRef } from 'react';
import type { Route } from './+types/evaluate.$id';
import { api } from '~/lib/api';
import type { Submission, Question } from '~/lib/types';
import { StatementModal } from '~/components/StatementModal';
import { Info, CircleChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { H1 } from "~/components/H1";
import { Transition, TransitionChild } from '@headlessui/react';
import { Back } from "~/components/Back";
import { ErrorBanner } from "~/components/ErrorBanner";
import { useSiweAuth } from '~/lib/auth'
import { useAppKitAccount } from '@reown/appkit/react';
import Drawer from '~/components/Drawer';

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
  const [assessments, setAssessments] = useState<Record<number, 'agree' | 'disagree' | 'neutral'>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);
  const { authenticated, role } = useSiweAuth()
  const { address } = useAppKitAccount()
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!authenticated || role !== 'evaluator') return;

    api.get<Submission>(`submissions/${submissionId}?karma=true`)
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

  useEffect(() => {
    const y = (progressRef.current?.offsetTop ?? 0) - 112;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [step]);

  if (!authenticated || role !== 'evaluator') return <Navigate to="/" />
  if (!submission) return <p className="p-8">Loading submission…</p>;

  const alreadyEvaluated = authenticated &&
    role === 'evaluator' &&
    address &&
    submission.evaluations.some((e: any) => e.evaluator.toLowerCase() === address.toLowerCase())

  if (alreadyEvaluated) return <Navigate to="/" />

  const total = submission.answers.length;

  const current = submission.answers[step];
  const q = questions.find((qq) => qq.id === current.question_id)!;

  const pct = Math.round((Object.keys(assessments).length / total) * 100);

  const next = () => step < total - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const allDone = Object.keys(assessments).length === total;
  const canSubmit = allDone && accepted;

  const fmtScore = (v: number | null) => (v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`);

  const handleSubmit = async () => {
    if (!authenticated) return setError("Please connect your wallet and sign in first.")
    setSubmitting(true);
    const codeMap = { agree: '1', disagree: '2', neutral: '3' } as const;

    const payload = {
      submission_id: submission.id,
      answers: submission.answers.map((a, idx) => ({
        question_id: a.question_id,
        answer: codeMap[assessments[idx]],
      })),
    };
    try {
      const token = localStorage.getItem('siwe-jwt')
      const result = await api.post('/evaluation', payload, token);
      navigate(`/success?from=evaluate&score=${result.score}&attestation=${result.eas_uid}`);
    } catch (err: any) {
        const msg = err.message ?? ''
        if (msg.includes('409')) {
          setError('You have already evaluated this submission.')
        } else if (msg.includes('403')) {
          setError('Evaluator role required.')
        } else {
          setError('There was an error submitting your evaluation. Please try again.')
        }
        setSubmitting(false)
      }
  };

  return (
    <div className="xl:flex xl:min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 xl:mr-[24rem]">
        {!submission && <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded" />}
        <Back />
        <H1>Evaluate Submission</H1>
        <div className='mb-8'>
          <p className='mb-3 inline-flex gap-2 items-center'>
                <CircleChevronRight width={20} height={20} className='shrink-0' />You will be asked whether you agree, disagree, or are neutral with a series of statements relating to the project's submission.</p>
            <p className='mb-3 inline-flex gap-2 items-center'>
                <CircleChevronRight width={20} height={20} className='shrink-0' />As much as possible, base your decisions on the answers provided.</p>
            <p className='mb-3 inline-flex gap-2 items-center'>
                <CircleChevronRight width={20} height={20} className='shrink-0' />We think there is a strong likelihood that projects will use LLMs to write/polish their answers.</p>
        </div>
        {/* Progress */}
        <div ref={progressRef} className="mb-6">
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
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4 space-y-6">
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

              <div className="space-y-2 border-t border-gray-300 dark:border-gray-500 pt-4">
                  <div className="flex items-start justify-between">
                      <label className="font-medium text-gray-800 dark:text-gray-200">Your Assessment</label>
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
              {(['agree', 'neutral', 'disagree'] as const).map((opt) => (
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

        {step === total - 1 && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-4 mt-6 space-y-6">
            <h2 className="text-xl font-semibold">Attestation</h2>
            <div className="flex items-center gap-3">
              <input
                id="accept"
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="h-16 w-16 md:h-12 md:w-12 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="accept" className="text-md text-gray-700 dark:text-gray-300">
                I hereby attest that I have evaluated the project to the best of my ability. Submission will mint an attestation on Optimism via the Ethereum Attestation Service (EAS).          </label>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-end gap-3 mt-6">
          {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}
          {step !== 0 && (
            <button
              onClick={back}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
            >
              <ArrowLeft height={16} width={16} className='me-2' /> Back
            </button>
          )}

            {step === total - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  canSubmit && !submitting
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
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
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition cursor-pointer"
              >
                Next <ArrowRight height={16} width={16} className='ms-2' />
              </button>
            )}
        </div>
      </div>
      
      <div className="hidden xl:block xl:fixed xl:right-0 xl:top-25 xl:max-h-full xl:w-full xl:max-w-md overflow-y-auto">
        <Drawer submission={submission} drawerOpen={true} isDesktop={true} fmtScore={fmtScore} />
      </div>

      <div className="block xl:hidden">
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
              <div className="absolute right-0 top-0 h-full w-full max-w-md">
                <Drawer submission={submission} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} fmtScore={fmtScore} />
              </div>
            </TransitionChild>
          </div>
        </Transition>
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
                  transition-colors
                  xl:hidden"
        style={{ writingMode: 'vertical-rl' }}
      >
        Project Details
      </button>
    </div>
  );
}
