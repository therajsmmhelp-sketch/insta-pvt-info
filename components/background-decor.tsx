"use client";

export function BackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-950/20 via-transparent to-transparent dark:from-fuchsia-950/30" />
      <div
        className="bg-blob w-[500px] h-[500px] bg-ig-purple top-[-10%] left-[-10%] animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="bg-blob w-[400px] h-[400px] bg-ig-pink bottom-[-10%] right-[-5%] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="bg-blob w-[350px] h-[350px] bg-ig-blue top-[30%] right-[10%] animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:44px_44px]" />
    </div>
  );
}
