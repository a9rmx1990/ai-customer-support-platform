'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, FileText, MessageSquare, ShieldCheck, Stethoscope, Ticket } from 'lucide-react';

const modules = [
  { href: '/doctors', icon: Stethoscope, title: 'Doctors', text: 'Browse available doctors and their specialties.' },
  { href: '/chat', icon: MessageSquare, title: 'Patient communication', text: 'Communicate securely with your appointed care team.' },
  { href: '/tickets', icon: Ticket, title: 'Support tickets', text: 'Raise and track a clinic support request.' },
  { href: '/knowledge', icon: FileText, title: 'Clinical knowledge', text: 'Manage approved clinic guidance and policies.' },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="surface-elevated rounded-2xl border border-triage-border p-8 sm:p-12">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded px-3 py-1 text-xs font-mono badge-mint">
            <ShieldCheck className="h-4 w-4" /> Supabase authenticated medical workspace
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Care coordination, built for <span className="text-clinical-mint">patients and doctors.</span>
          </h1>
          <p className="max-w-2xl text-gray-300">
            Secure appointments, doctor-patient communication, lab-result access, and clinic support in one medical platform.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/doctors" className="inline-flex items-center gap-2 rounded-lg bg-clinical-mint px-5 py-3 text-sm font-semibold text-surface-base">
              Find a doctor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/doctors" className="inline-flex items-center gap-2 rounded-lg border border-triage-border px-5 py-3 text-sm font-semibold text-white">
              <Calendar className="h-4 w-4" /> Appointments
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="surface-elevated rounded-xl border border-triage-border p-5 transition hover:border-clinical-mint/60">
            <Icon className="mb-4 h-6 w-6 text-clinical-mint" />
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-400">{text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
