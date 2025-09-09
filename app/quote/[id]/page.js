'use client';
import QuoteClient from './QuoteClient';

export default function Page({ params }) {
  return <QuoteClient id={params.id} />;
}
