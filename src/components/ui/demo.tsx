import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[460px] bg-black/[0.96] border-neutral-800 relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-700/60 w-fit mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-300">
              SPLINE 3D ENGINE
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
            Attention-Aware 3D Core
          </h2>
          <p className="mt-3 text-neutral-400 text-sm max-w-md leading-relaxed">
            Hush pairs real-time conversational timing with a spatial neural visual.
            Evaluate importance, check mid-thought pauses, and control model generation before speech.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative min-h-[220px]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
