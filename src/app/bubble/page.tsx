import type { Metadata } from "next";
import { BubbleMeter } from "@/components/bubble/bubble-meter";

export const metadata: Metadata = { title: "Your bubble" };

export default function BubblePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-bold tracking-[-0.03em]">Your bubble</h1>
      <p className="mt-4 max-w-[60ch] font-serif text-[19px] leading-[1.5] text-ink-2">
        Every article you open from Verso lands somewhere on the spectrum. This is where your last thirty days of reading
        sit. It lives only in this browser; nothing is sent anywhere.
      </p>
      <BubbleMeter />
    </div>
  );
}
