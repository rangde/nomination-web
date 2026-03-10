import { NominationFormProvider } from './NominationFormProvider';

export default function NominationFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NominationFormProvider>{children}</NominationFormProvider>;
}
