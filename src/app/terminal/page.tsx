import TerminalWrapper from '@/components/TerminalWrapper';
import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Terminal | Mobile Shell Terminal',
  description: 'Real shell terminal accessible from iPhone Safari',
};

export default function TerminalPage() {
  return <TerminalWrapper />;
}