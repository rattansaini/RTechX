/**
 * "How these were built" as four floating layers in 3D: an idea from the desk
 * at the top, the working tool at the bottom. Each layer is lifted by
 * translateZ inside a tilted scene, so they read as an exploded stack.
 * Pure CSS; under reduced motion the stack simply doesn't drift.
 */

const LAYERS = [
  { title: "A problem from a real desk", body: "A task recruiters repeat every day.", tone: "bg-white text-ink border-line" },
  { title: "The RTechX method", body: "How the Masterclass teaches it, as rules.", tone: "bg-blue-50 text-ink border-blue-200" },
  { title: "Claude, the AI", body: "Turns the method into answers.", tone: "bg-blue text-white border-blue" },
  { title: "A tool on rtechx.com", body: "Next.js, Supabase, Netlify.", tone: "bg-ink text-white border-ink" },
];

const GAP = 78; // px between layers in depth

export function BuildStack() {
  return (
    <div className="flex items-center justify-center py-10 [perspective:1600px]" aria-hidden="false">
      <ol
        aria-label="How each tool was built, from idea to website"
        className="relative h-[17rem] w-full max-w-[22rem] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-34deg)] motion-safe:animate-[stack-float_6s_ease-in-out_infinite]"
      >
        {LAYERS.map((l, i) => (
          <li
            key={l.title}
            style={{ transform: `translateZ(${(LAYERS.length - 1 - i) * GAP}px)` }}
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[18px] border p-5 shadow-[0_24px_40px_-16px_rgba(10,31,68,0.45)] ${l.tone}`}
          >
            <span className="font-display text-sm font-bold opacity-60">Layer {i + 1}</span>
            <p className="font-display text-xl font-extrabold leading-tight">{l.title}</p>
            <p className="mt-1 text-sm leading-snug opacity-80">{l.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
