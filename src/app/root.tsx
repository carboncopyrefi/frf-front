import { useEffect, useState, Fragment } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Link } from "react-router";
import { Moon, Sun, Menu } from 'lucide-react';
import { Transition } from '@headlessui/react';
import ClientOnly from '~/components/ClientOnly'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { projectId, metadata, networks, wagmiAdapter } from './config'
import ConnectButton from '~/components/ConnectButton'
import { SubmissionButton } from '~/components/SubmissionButton'
import { createSIWE  } from './lib/siwe-stubs'
import ServerError from "./routes/errors/server-error";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const queryClient = new QueryClient()
const siweConfig = createSIWE(networks);

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  siweConfig,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeVariables: {
    "--apkt-color-mix": "#4f39f6",
    "--apkt-accent": "#ffffff",
    "--apkt-font-family": "Arial",
    "--apkt-border-radius-master": "12px",
    "--apkt-font-size-master": "",
    "--apkt-color-mix-strength": 40,
  },
})

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ClientOnly>
          <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </WagmiProvider>
        </ClientOnly>
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {

  NProgress.configure({
    showSpinner: false,
  });

  /* ---------- dark-mode ---------- */
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : system;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [navigation.state]);

  return (
    <div
      className={`
        min-h-screen
        bg-gradient-to-br from-gray-50 to-gray-100
        dark:from-gray-900 dark:to-gray-950
        text-gray-800 dark:text-gray-100
        transition-colors duration-300
      `}
    >
      {/* ----- global header (only dark toggle for now) ----- */}
      <header className="py-3 sticky top-0 z-20 bg-white/70 dark:bg-gray-950/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/">
              <h1 className="hidden sm:block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Funding Readiness Framework
              </h1>
              <h1 className="sm:hidden text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                FRF
              </h1>
            </Link>

            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ConnectButton />
              <SubmissionButton />
              <button
                onClick={() => setDark((v) => !v)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <Sun />
                ) : (
                  <Moon />
                )}
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-2">
              {/* <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Menu"
              >
                <Menu />
              </button> */}
              <ConnectButton />
              <SubmissionButton mobile />
              {/* dark toggle stays visible on mobile */}
              <button
                onClick={() => setDark((v) => !v)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <Sun />
                ) : (
                  <Moon />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ----- page outlet ----- */}
      <main className="max-w-7xl mx-auto px-0 lg:py-6">
        <Outlet />
      </main>

      <footer className="sticky top-full mt-auto bg-white/70 dark:bg-gray-950/70 backdrop-blur border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0 text-sm text-center sm:text-left">
          {/* Copyright */}
          <span className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CARBON Copy
          </span>

          {/* Links */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4">
            <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              About FRF
            </Link>
            <Link to="https://carboncopy.news" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              CARBON Copy
            </Link>
            <Link to="https://karma.xyz" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Karma
            </Link>
            <Link to="https://attest.org" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Ethereum Attestation Service
            </Link>
          </div>
        </div>
      </footer>
    </div>  
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <ServerError error={error} />;
}
