import { cn } from "@/lib/utils";

export function AsciiArt({ className }: { className?: string }) {
  return <div className={cn("ascii-art", className)} aria-hidden="true">
    <video
      className="ascii-video"
      src="/media/redshift-ascii.mp4"
      poster="/media/redshift-ascii-poster.jpg"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  </div>;
}
