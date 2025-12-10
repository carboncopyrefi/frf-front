import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

export function StatementModal({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)} className="relative z-50">
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="mx-auto max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl">
              <DialogTitle className="text-lg font-semibold mb-2">{title}</DialogTitle>
              <div className="text-gray-700 dark:text-gray-300">{children}</div>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
