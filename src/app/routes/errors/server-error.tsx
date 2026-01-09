import type { Route } from '../+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Server error | Funding Readiness Framework by CARBON Copy' },
    { name: 'description', content: '500 - Server error' },
  ];
}

export default function ServerError({ error }: { error?: Error }) {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">500 - Something went wrong</h1>
      <p className="mb-6 text-gray-600">
        {error?.message || "Please try again later."}
      </p>
      <a href="/" className="text-blue-600 hover:underline">
        Go back home
      </a>
    </div>
  );
}
