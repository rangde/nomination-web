import { redirect } from 'next/navigation';

function RootPage() {
  redirect('/login');
}

export default RootPage;
