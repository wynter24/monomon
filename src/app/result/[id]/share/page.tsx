import SharedResultClient from '@/components/result/SharedResultClient';

type Params = Promise<{ id: string }>;

export default async function SharePage({ params }: { params: Params }) {
  const { id } = await params;
  return <SharedResultClient id={id} />;
}
