import { useLoaderData, redirect } from 'react-router';
import { Link } from "react-router";
import type { Route } from '../+types/root';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || 'unknown';

  if (!from || (from !== 'evaluate')) {
    throw redirect('/');
  }

  return { from};
}

export default function Success() {
  const { from } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">

      {from === 'evaluate' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Evaluation saved!</h1>
          <p>Thank you for assessing this submission.</p>
        </>
      )}

      <Link to="/" className="mt-6 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
        Back home
      </Link>
    </div>
  );
}