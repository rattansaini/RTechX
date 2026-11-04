/**
 * "How these were built" as four stacked layers in 3D: an idea from the desk
 * at the top, the working tool at the bottom. Pure CSS transforms; under
 * reduced motion the stack simply doesn't float.
 */

const LAYERS = [
  { title: "A problem from a real desk", body: "Rattan picks a task recruiters repeat every day.", tone: "bg-white text-ink border-line" },
  { title: "The RTechX method", body: "The way the Masterclass teaches it, written as rules.", tone: "bg-blue-50 text-ink border-blue-200" },
  { title: "Claude, the AI", body: "Turns the method into answers, in a fixed shape.", tone: "bg-blue text-white border-blue" },
  { title: "A tool on rtechx.com", body: "Next.js website, Supabase database, hosted on Netlify.", tone: "bg-ink text-white border-ink" },
];

export function BuildStack() {
  return (
    <div className="flex items-center justify-center py-6 [perspective:1400px]">
      <ol
        aria-label="How each tool was built, from idea to website"
        className="relative w-full max-w-sm [transform-style:preserve-3d] [transform:rotateX(52deg)_rotateZ(-38deg)] motion-safe:animate-[stack-float_6s_ease-in-out_infinite]"
      >
        {LAYERS.map((l, i) => (
          <li
            key={l.title}
            style={{ marginTop: i === 0 ? 0 : "-2.75rem", zIndex: LAYERS.length - i }}
            className={`relative rounded-[18px] border p-5 shadow-[0_18px_30px_-12px_rgba(10,31,68,0.45)] ${l.tone}`}
          >
            <p className="font-display text-lg font-extrabold leading-tight">{l.title}</p>
            <p className="mt-1 text-sm leading-snug opacity-80">{l.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
