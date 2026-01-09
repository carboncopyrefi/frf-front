import { Icon } from "~/components/Icons"
import Markdown from "react-markdown";
import { ChevronRightIcon } from 'lucide-react';
import { Transition, Disclosure, DisclosurePanel, DisclosureButton } from '@headlessui/react';

interface DrawerProps {
  submission: any;
  drawerOpen: boolean;
  setDrawerOpen?: (open: boolean) => void; // Optional for desktop
  isDesktop?: boolean; // Optional to determine if this is desktop view
  fmtScore?: (score: number | null) => string; // Optional formatting function
}

export default function Drawer({
  submission,
  drawerOpen,
  setDrawerOpen,
  isDesktop = false,
  fmtScore = (v: number | null) => (v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`)
}: DrawerProps) {

  // Only show close button on mobile or when setDrawerOpen is provided
  const showCloseButton = !isDesktop && setDrawerOpen;

  return (
    <div className={`${isDesktop ? 'relative' : 'absolute right-0 top-0 h-full'} w-full max-w-md bg-white dark:bg-gray-900 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold">{submission.project_name}</h3>
        {showCloseButton && (
          <button
            onClick={() => setDrawerOpen?.(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Accordion */}
        <div className="">
          {/* Links */}
          <Disclosure defaultOpen>
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <span>Links</span>
                  <ChevronRightIcon className={`${open ? 'rotate-90' : ''} h-5 w-5 text-indigo-500`} />
                </DisclosureButton>
                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                  <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-300">
                    {submission.karma_data?.project_details?.links?.filter((l: any) => l.url).length ? (
                      <div className="flex items-center gap-3">
                        {submission.karma_data.project_details.links
                          .filter((l: any) => l.url)
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
                      <p className="text-sm text-gray-700 dark:text-gray-300">No links</p>
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
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 mt-2">
                  <span>Description</span>
                  <ChevronRightIcon className={`${open ? 'rotate-90' : ''} h-5 w-5 text-indigo-500`} />
                </DisclosureButton>
                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                  <DisclosurePanel className="px-4 pt-2 pb-2 text-gray-700 dark:text-gray-300">
                    <div className="prose dark:prose-invert max-w-none text-sm">
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
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 mt-2">
                  <span>Karma Updates</span>
                  <ChevronRightIcon className={`${open ? 'rotate-90' : ''} h-5 w-5 text-indigo-500`} />
                </DisclosureButton>
                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                  <DisclosurePanel className="px-4 pt-2 pb-2 text-gray-700 dark:text-gray-300 space-y-3">
                    {submission.karma_data?.updates?.length ? (
                      submission.karma_data.updates.map((u: any) => (
                        <div key={u.date} className='border-b pb-3 border-gray-200 dark:border-gray-600'>
                          <h3 className="text-md font-bold">{u.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(u.date).toLocaleDateString()}</p>
                          <p className="mt-1 prose dark:prose-invert text-sm"><Markdown>{u.description}</Markdown></p>
                          <p>{u.verified}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">No Karma updates</p>
                    )}
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>

          {/* Past Submissions */}
          <Disclosure>
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 mt-2">
                  <span>Past Submissions</span>
                  <ChevronRightIcon className={`${open ? 'rotate-90' : ''} h-5 w-5 text-indigo-500`} />
                </DisclosureButton>
                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                  <DisclosurePanel className="px-4 pt-2 pb-2 text-gray-700 dark:text-gray-300 space-y-3">
                    {submission.past_submissions.length ? (
                      submission.past_submissions.map((u: any) => (
                        <div key={u.date} className='border-b pb-3 border-gray-200 dark:border-gray-600'>
                          <p className="text-md"><strong>Date Completed:</strong> {new Date(u.date_completed).toLocaleDateString()}</p>
                          <p className="mt-1"><strong>Score:</strong> {fmtScore(u.score)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">No past submissions</p>
                    )}
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
      </div>

      {/* Footer (optional) - only show on mobile */}
      {!isDesktop && setDrawerOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}