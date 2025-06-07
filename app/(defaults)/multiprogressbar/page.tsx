'use client';
import MultiStepProgressBar from "@/components/datatables/components-datatables-multiprogressbar";

export default function Page() {
  const steps = [
    { label: 'Onboarding Stage', status: 'complete', tasks: '2/2 tasks' },
    { label: 'Design Stage', status: 'inprogress', tasks: '4/5 tasks' },
    { label: 'Development', status: 'inprogress', tasks: '0/1 tasks' },
    { label: 'Website Review', status: 'upcoming', tasks: 'not started' },
    { label: 'Deployment', status: 'upcoming', tasks: 'not started' },
    { label: 'Offboarding', status: 'upcoming', tasks: 'not started' },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <MultiStepProgressBar steps={steps} />
    </div>
  );
}
