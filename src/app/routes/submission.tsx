import { useLoaderData, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import type { Route } from './+types/submission';
import { api } from '~/lib/api';
import type { Question } from '~/lib/types';
import { StatementModal } from '~/components/StatementModal';
import { Info, CircleChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { Autocomplete } from '~/components/Autocomplete';
import { H1 } from "~/components/H1";
import { Back } from "~/components/Back";
import { ErrorBanner } from "~/components/ErrorBanner";

export async function loader(): Promise<{ questions: (Question & { id: string })[] }> {
  return { questions: await api.get<(Question & { id: string })[]>('questions') };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Make Submission' }];
}

export default function Submission() {
  const { questions } = useLoaderData<typeof loader>();
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /* ---------- derive ordered sections ---------- */
  const NAME_IX   = -2; // synthetic
  const KARMA_IX  = -1;
  const CATEGORY  = import.meta.env.VITE_CATEGORY
  const sections  = ['Project', ...Array.from(new Map(questions.map(q => [q.section,q])).values()).sort((a,b)=>a.order-b.order).map(q=>q.section)];

  const [step, setStep] = useState(0); // index into sections[]
  const [answers, setAnswers] = useState<Record<number, string>>({});

  /* ---------- helpers ---------- */
  const currentSection = sections[step];
  const sectionQuestions = questions.filter((q) => q.section === currentSection);

  const isLast = step === sections.length - 1;

  const allFilled = sectionQuestions.every((q) => (answers[questions.indexOf(q)] || '').trim() !== '');


  /* ---------- modal ---------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const openModal = (title: string, text: string) => {
    setModalContent({ title, text });
    setModalOpen(true);
  };

  useEffect(() => {
    api.get<any>('https://api.carboncopy.news/projects')
      .then((raw) => setProjects(Array.isArray(raw.projects) ? raw.projects : []))
      .catch(() => setProjects([])); // silent fail
  }, []);

  /* ---------- navigation ---------- */
  const next = () => step < sections.length - 1 && setStep(step + 1);
  // const back = () => step > 0 && setStep(step - 1);

  /* ---------- submit ---------- */
    const handleSubmit = async () => {
        setSubmitting(true);
        const payload = {
            project_id: String(
                answers[NAME_IX]
                    ? projects.find((p) => p.name === answers[NAME_IX])?.id ?? ''
                    : ''
            ),
            project_name: answers[NAME_IX] || '',
            karma_gap_id: answers[KARMA_IX] || '',
            answers: questions.map(q => ({
            question_id: q.id,
            answer: answers[questions.indexOf(q)] || '',
            })),
            category: CATEGORY,
        };
        try {
            const res = await api.post<{ id: string }>('/submission', payload);
            navigate(`/submissions/${res.id}`);
        } catch (error) {
            setError('There was an error submitting your answers. Please try again.');
            setSubmitting(false);
        }
    };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <Back />
        <H1>Make Submission</H1>
        <div className='mb-10'>
            <p className='mb-3 inline-flex gap-2'>
                <CircleChevronRight />Fill in the information provided to the best of your knowledge.</p>
            <p className='mb-3 inline-flex gap-2'>
                <CircleChevronRight />Answers are limited to 300 words (1800 characters) to encourage clarity and conciseness.</p>
            <p className='mb-3 inline-flex gap-2'>
                <CircleChevronRight />Evaluators will be asked whether they agree, disagree or neither with your answers.
            </p>
        </div>

      {/* Progress bar */}
      <div className="flex items-center mb-8 flex-wrap gap-x-4 gap-y-2">
        {sections.map((s, idx) => (
          <div key={s} className="flex items-center" onClick={() => setStep(idx)}>
            <button
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${idx <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                `}
                aria-label={`Go to section ${idx + 1}`}
            >
                {idx + 1}
            </button>
            <span className="ml-2 text-sm hidden md:inline cursor-pointer hover:underline">{s}</span>
            {idx < sections.length - 1 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 ml-2" />}
          </div>
        ))}
      </div>

      {/* Current section */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm dark:shadow-none inset-shadow-sm dark:inset-shadow-gray-800 p-6 space-y-6">
        <h2 className="text-xl font-semibold">{currentSection}</h2>

        {step === 0 && (
            <div className="space-y-6">
                <div className='space-y-2'>
                    <div>
                        <label className="font-medium text-gray-800 dark:text-gray-200">Name</label>
                    </div>
                      <Autocomplete
                          loading={!projects.length}
                          value={answers[NAME_IX] || ''} // ← keeps it alive
                          options={projects.map((p) => ({ value: p.id, label: p.name }))}
                          placeholder="Start typing project name…"
                          onChange={(opt) => {
                              const karma = projects.find((p) => p.id === opt?.value)?.karma_slug || '';
                              setAnswers({ ...answers, [NAME_IX]: opt?.label || '', [KARMA_IX]: karma });
                          }}
                      />
                    <div>
                      <button
                        type="button"
                        onClick={() => openModal('Missing Project', "Reach out at hello@carboncopy.news and we'll get you added to our database.")}
                        className="text-indigo-600 dark:text-indigo-400 cursor-pointer text-sm"
                      >
                        Don't see your project in the list?
                      </button>
                    </div>
                </div>
                <div className='space-y-2'>
                  <div className="flex items-start justify-between">
                      <label className="font-medium text-gray-800 dark:text-gray-200">Karma ID</label>
                      <button
                          type="button"
                          onClick={() => openModal('Karma Project', "You can find this by navigating to your Karma project's page and looking at its URL.")}
                          className="text-indigo-600 dark:text-indigo-400 cursor-pointer"
                      >
                      <Info />
                      </button>
                  </div>
                  <input
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
                      value={answers[KARMA_IX] || ''}
                      onChange={e => setAnswers({...answers, [KARMA_IX]: e.target.value})}
                  />
                </div>
            </div>
        )}

        {sectionQuestions.map((q, idx) => {
          const globalIndex = questions.indexOf(q);
          return (
            <div key={globalIndex} className="space-y-2">
              <div className="flex items-start justify-between">
                <label className="font-medium text-gray-800 dark:text-gray-200">
                  {q.project_statement}
                </label>
                <button
                  type="button"
                  onClick={() => openModal('Additional Context', q.project_description)}
                  className="text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  <Info />
                </button>
              </div>

              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={8}
                maxLength={1800}
                required
                value={answers[globalIndex] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [globalIndex]: e.target.value })
                }
                placeholder="Your answer…"
              />
            </div>
          );
        })}
      </div>

    {/* Navigation */}
    <div className="flex items-center justify-end gap-3 mt-6">
        {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}
        {step > 0 && (
            <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                <ArrowLeft height={16} width={16} className='me-2' /> Back
            </button>
        )}
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allFilled || submitting}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              allFilled && !submitting
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
              'Submit'
            )}
          </button>
        ) : (
            <button
                onClick={next}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                Next <ArrowRight height={16} width={16} className='ms-2' />
            </button>
        )}
        </div>

      {/* reusable modal */}
      <StatementModal
        open={modalOpen}
        setOpen={setModalOpen}
        title={modalContent.title}
      >
        {modalContent.text}
      </StatementModal>
    </div>
  );
}
