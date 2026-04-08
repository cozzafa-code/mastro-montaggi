// app/azienda/[code]/page.tsx
import PortaleAzienda from '../../../components/PortaleAzienda';

export default function AziendaPage({ params }: { params: { code: string } }) {
  return <PortaleAzienda inviteCode={params.code} />;
}
