"use client";

import { CalendarCheck, Check, Sparkles } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState } from "react";

const STAGES = {
  user: 1,
  typing: 2,
  reply: 3,
  card: 4,
  booked: 5,
} as const;

const TIMELINE: { stage: number; after: number }[] = [
  { stage: STAGES.user, after: 600 },
  { stage: STAGES.typing, after: 1_100 },
  { stage: STAGES.reply, after: 1_400 },
  { stage: STAGES.card, after: 1_200 },
  { stage: STAGES.booked, after: 1_600 },
  { stage: 0, after: 3_200 },
];

/**
 * The hero product mock, playing a looping conversation: question → AI
 * thinking → answer → tap-to-book → confirmed. Falls back to the fully
 * rendered static conversation when reduced motion is requested.
 */
export const WidgetMock = () => {
  const [stage, setStage] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(STAGES.booked);
      return;
    }
    setAnimated(true);

    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      const step = TIMELINE[index % TIMELINE.length]!;
      timer = setTimeout(() => {
        setStage(step.stage);
        index += 1;
        advance();
      }, step.after);
    };
    advance();
    return () => clearTimeout(timer);
  }, []);

  const show = (threshold: number) =>
    stage >= threshold || (!animated && stage === 0);

  const enter = (visible: boolean) =>
    cn(
      "transition-all duration-500 ease-out",
      visible
        ? "translate-y-0 scale-100 opacity-100"
        : "pointer-events-none translate-y-2 scale-[0.97] opacity-0"
    );

  return (
    <div className="w-[340px] overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
      {/* header */}
      <div className="bg-gradient-to-b from-zinc-100 to-zinc-200 px-5 py-5">
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-semibold text-white">
            H
          </span>
          <span className="text-xs font-medium tracking-wide">
            Lumière Med Spa
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Online
          </span>
        </div>
        <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
          Hi there! 👋
        </p>
        <p className="text-sm text-zinc-600">
          Book an appointment or ask us anything.
        </p>
      </div>

      {/* conversation */}
      <div className="min-h-[236px] space-y-3 p-4">
        <div
          className={cn(
            "ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-b from-zinc-900 to-zinc-700 px-3.5 py-2 text-sm text-white",
            enter(show(STAGES.user))
          )}
        >
          Do you have anything for Botox this Friday?
        </div>

        {/* AI thinking indicator */}
        {stage === STAGES.typing && (
          <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-3.5 py-2.5 shadow-sm">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-bounce rounded-full bg-zinc-400"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            "w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-800 shadow-sm",
            enter(show(STAGES.reply))
          )}
        >
          We do! I have <span className="font-medium">Fri 2:00 PM</span> and{" "}
          <span className="font-medium">4:30 PM</span> open with our nurse
          injector. Want me to book one?
        </div>

        <div
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left shadow-sm transition-colors",
            stage >= STAGES.booked
              ? "border-emerald-200 bg-emerald-50"
              : "border-zinc-200 bg-white",
            enter(show(STAGES.card))
          )}
        >
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-xl transition-colors",
                stage >= STAGES.booked
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-zinc-100 text-zinc-700"
              )}
            >
              {stage >= STAGES.booked ? (
                <Check className="size-4" />
              ) : (
                <CalendarCheck className="size-4" />
              )}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">
                {stage >= STAGES.booked
                  ? "Booked — Fri, 2:00 PM"
                  : "Book Fri, 2:00 PM"}
              </span>
              <span className="text-xs text-zinc-500">
                {stage >= STAGES.booked
                  ? "Confirmation sent · staff alerted"
                  : "Botox · 30 min"}
              </span>
            </span>
          </span>
          <Sparkles
            className={cn(
              "size-4",
              stage >= STAGES.booked ? "text-emerald-500" : "text-zinc-400"
            )}
          />
        </div>
      </div>

      {/* input */}
      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5">
          <span className="text-sm text-zinc-400">Type a message…</span>
          <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white">
            ↑
          </span>
        </div>
      </div>
    </div>
  );
};
