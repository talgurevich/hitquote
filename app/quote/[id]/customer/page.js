'use client';
import CustomerQuoteClient from './CustomerQuoteClient';

export default function Page({ params }) {
  return <CustomerQuoteClient id={params.id} />;
}