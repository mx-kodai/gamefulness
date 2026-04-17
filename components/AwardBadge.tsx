import { Award, AwardIcon } from "@/lib/awards";

const COLOR_MAP = {
  red: "bg-red",
  yellow: "bg-yellow",
  blue: "bg-blue",
  green: "bg-green",
  ink: "bg-ink",
} as const;

export default function AwardBadge({
  award,
  unlocked,
  size = "md",
}: {
  award: Award;
  unlocked: boolean;
  size?: "md" | "lg";
}) {
  const sizeCls = size === "lg" ? "aspect-square w-full" : "aspect-square w-full";
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border-2 border-ink ${
        unlocked ? "bg-bg ring-ink-sm" : "bg-bg-ink/40"
      }`}
    >
      <div
        className={`${sizeCls} flex flex-col items-center justify-center gap-1 p-3 ${
          unlocked ? "" : "opacity-40 grayscale"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink ${COLOR_MAP[award.color]} text-bg`}
        >
          <AwardIconSvg icon={award.icon} />
        </div>
        <div className="text-center font-display text-[12px] font-black leading-tight md:text-[13px]">
          {award.title}
        </div>
        <div className="text-center text-[10px] leading-tight text-ink-soft md:text-[11px]">
          {award.description}
        </div>
      </div>
      {!unlocked && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-full border-2 border-ink bg-bg px-2 py-0.5 text-[9px] font-bold">
          LOCKED
        </div>
      )}
    </div>
  );
}

export function AwardIconSvg({ icon }: { icon: AwardIcon }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
        </svg>
      );
    case "flame":
      return (
        <svg {...common}>
          <path d="M12 3s4 4 4 8a4 4 0 01-8 0c0-2 1-3 1-3s-2 1-2 4a6 6 0 0012 0c0-5-7-9-7-9z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" />
          <path d="M4 20L14 10" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="M3 8l4 4 5-7 5 7 4-4v10H3z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 017-2 4 4 0 017 2c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3l2.6 6.2 6.4.6-4.9 4.3 1.5 6.3L12 17l-5.6 3.4 1.5-6.3L3 9.8l6.4-.6L12 3z" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14A8 8 0 0110 4a8 8 0 1010 10z" />
        </svg>
      );
  }
}
