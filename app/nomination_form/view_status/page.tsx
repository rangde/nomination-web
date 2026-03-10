import { Suspense } from 'react';
import ViewFormStatus from '@/components/nomination/ViewFormState';

export default async function ViewState({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const name = params.name;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewFormStatus name={name} />
    </Suspense>
  );
}
