import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-ig-gradient">
        404
      </h1>
      <p className="text-slate-400">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-ig-gradient text-white text-sm font-semibold"
      >
        Back to search
      </Link>
    </div>
  );
}
