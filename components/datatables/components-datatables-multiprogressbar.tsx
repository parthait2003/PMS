'use client';
import React from 'react';
import { Check, Clock } from 'lucide-react';
import clsx from 'clsx';

type Step = {
  label: string;
  status: 'complete' | 'inprogress' | 'upcoming';
};

type Props = {
  steps: Step[];
};

export default function FancyProgressBar({ steps }: Props) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-6 relative">
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const previousStep = steps[index - 1];

        const isComplete = step.status === 'complete';
        const isCurrent = step.status === 'inprogress';

        // Line before: green only if prev step is complete
        const lineBeforeColor = previousStep?.status === 'complete' ? 'bg-emerald-500' : 'bg-gray-300';

        return (
          <div key={index} className="relative flex-1 flex flex-col items-center text-center">
            {/* Left connector */}
            {!isFirst && (
              <div
                className={clsx('absolute top-4 left-0 h-0.5', lineBeforeColor)}
                style={{ width: '50%', zIndex: 0 }}
              />
            )}
            {/* Right connector (always gray) */}
            {!isLast && (
              <div
                className="absolute top-4 right-0 h-0.5 bg-gray-300"
                style={{ width: '50%', zIndex: 0 }}
              />
            )}

            {/* Icon */}
            <div
              className={clsx(
                'w-8 h-8 rounded-md border-2 flex items-center justify-center mb-2 z-10',
                {
                  'bg-emerald-500 border-emerald-500 text-white': isComplete,
                  'border-gray-300 text-gray-400 bg-white': !isComplete,
                }
              )}
            >
              {isComplete ? <Check size={16} /> : <Clock size={16} />}
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-gray-800">{step.label}</div>
           
          </div>
        );
      })}
    </div>
  );
}
