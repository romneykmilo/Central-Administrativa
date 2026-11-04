import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Central Administrativa | Gestão e Serviços Corporativos',
  description: 'Plataforma integrada de serviços administrativos, chamados, patrimônio, logística, facilities e contratos.',
  openGraph: {
    title: 'Central Administrativa | Gestão e Serviços Corporativos',
    description: 'Plataforma integrada de serviços administrativos, chamados, patrimônio, logística, facilities e contratos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Central Administrativa | Gestão e Serviços Corporativos',
    description: 'Plataforma integrada de serviços administrativos, chamados, patrimônio, logística, facilities e contratos.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
