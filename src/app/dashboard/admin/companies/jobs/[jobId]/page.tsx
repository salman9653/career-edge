
'use client';
import { redirect } from 'next/navigation';

export default function AdminCompanyJobPage({ params }: { params: { jobId: string } }) {
  redirect(`/dashboard/company/jobs/${params.jobId}`);
  return null;
}
