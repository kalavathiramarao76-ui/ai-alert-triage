'use client';

import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'at_onboarding';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: 'Welcome to Alert Triage',
    description:
      'Your AI-powered command center for SRE teams. Cut through alert noise, auto-classify incidents by priority, and reduce MTTR from hours to minutes. Built for on-call engineers who need signal, not noise.',
    icon: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/25">
        AT
      </div>
    ),
  },
  {
    title: 'Paste or Receive Alerts',
    description:
      'Drop raw alert JSON into the inbox, or wire up webhooks from PagerDuty, Datadog, Grafana, and more. Every alert lands in a unified feed — no context-switching between tools.',
    icon: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.5 0V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0111.048 0c1.131.094 1.976 1.057 1.976 2.192V13.5" />
        </svg>
      </div>
    ),
  },
  {
    title: 'AI Triages Automatically',
    description:
      'Our AI engine assigns priority (P0-P4), categorizes by domain (infra, app, network, security, DB), detects duplicates, groups related alerts into incidents, and filters out noise — all in seconds.',
    icon: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
    ),
  },
];

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ['#22c55e', '#facc15', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute confetti-piece"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 800,
    left: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} delay={p.delay} left={p.left} />
      ))}
    </div>
  );
}

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShow(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finish
      setShowConfetti(true);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          localStorage.setItem(ONBOARDING_KEY, 'true');
          setShow(false);
          setShowConfetti(false);
          setExiting(false);
        }, 400);
      }, 2000);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setExiting(true);
    setTimeout(() => {
      setShow(false);
      setExiting(false);
    }, 300);
  }, []);

  if (!show) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {showConfetti && <Confetti />}
      <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 ${exiting ? 'onboarding-exit' : ''}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        {/* Card */}
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden onboarding-card-enter">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors z-10"
          >
            Skip tour
          </button>

          {/* Content */}
          <div className="relative px-8 pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">{step.icon}</div>

            <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="relative px-8 pb-8">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-8 bg-green-500'
                      : i < currentStep
                      ? 'w-4 bg-green-500/40'
                      : 'w-4 bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>

            <p className="text-center text-[11px] text-zinc-600 mt-3">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
