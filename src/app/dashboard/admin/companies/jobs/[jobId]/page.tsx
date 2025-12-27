
'use client';;
import { use } from "react";
import { redirect } from 'next/navigation';

export default function AdminCompanyJobPage(props: { params: Promise<{ jobId: string }> }) {
  const params = use(props.params);
  redirect(`/dashboard/company/jobs/${params.jobId}`);
  return null;
}
