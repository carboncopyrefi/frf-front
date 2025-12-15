import { redirect, type LoaderFunctionArgs } from 'react-router';
import { api } from '~/lib/api';

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) throw new Response('Missing slug', { status: 400 });

  // 1. fetch by slug
  const project = await api.get<{ id: string | number }>(`projects/${params.id}`);

  // 2. extract id
  const submissionId = String(project.id);

  // 3. redirect to existing submission page
  throw redirect(`/submissions/${submissionId}`);
}

// no component needed – we always redirect
export default function ProjectPage() {
  return null;
}