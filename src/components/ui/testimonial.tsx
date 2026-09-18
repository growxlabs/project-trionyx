"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { TimelineContent } from "@/components/ui/timeline-animation";

export function ClientFeedback() {
  const testimonialRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.18,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(8px)",
      y: -16,
      opacity: 0,
    },
  };

  return (
    <section
      className="relative w-full bg-[#F7F6F0] py-16 sm:py-20 lg:py-24 text-[#171714] overflow-hidden"
      ref={testimonialRef}
    >
      {/* Section Header: Trionyx Editorial Hierarchy */}
      <article className="max-w-screen-md mx-auto text-center space-y-3 px-4 sm:px-6">
        <TimelineContent
          as="span"
          className="text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#68665F] font-mono block"
          animationNum={0}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          CUSTOMER REVIEWS
        </TimelineContent>

        <TimelineContent
          as="h2"
          style={{
            fontFamily: '"Instrument Sans", sans-serif',
            letterSpacing: '-0.03em',
          }}
          className="text-[32px] sm:text-[40px] lg:text-[46px] font-semibold leading-[1.1] text-[#171714]"
          animationNum={1}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          Trusted across studios and certified installers.
        </TimelineContent>

        <TimelineContent
          as="p"
          className="mx-auto text-[15px] sm:text-[16px] text-[#68665F] max-w-xl font-normal leading-[1.6]"
          animationNum={2}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          What automotive professionals, studio partners, and vehicle owners say about Trionyx surface protection.
        </TimelineContent>
      </article>

      {/* 3-Column Bento Grid matching component structure */}
      <div className="lg:grid lg:grid-cols-3 gap-3.5 flex flex-col w-full max-w-[1340px] mx-auto lg:py-12 pt-10 pb-4 lg:px-8 px-4">
        {/* COLUMN 1 */}
        <div className="md:flex lg:flex-col lg:space-y-3.5 h-full lg:gap-0 gap-3.5">
          {/* Card 1: Studio Owner (Large Featured Card) */}
          <TimelineContent
            animationNum={0}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-[#FCFBF7] text-[#171714] overflow-hidden rounded-xl border border-[rgba(23,23,20,0.08)] p-6 shadow-[0_2px_10px_rgba(23,23,20,0.02)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#17171408_1px,transparent_1px),linear-gradient(to_bottom,#17171408_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
            
            <div className="flex items-center gap-1 mb-4 text-[#F26522]">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto relative z-10">
              <p className="text-[15px] sm:text-[16px] leading-[1.65] font-normal text-[#171714]">
                &ldquo;Trionyx PPF has elevated our detailing studio. The edge stretchability and self-healing clear coat make installation seamless on complex body contours.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-6 border-t border-[rgba(23,23,20,0.06)] mt-6">
                <div>
                  <h3 className="font-semibold lg:text-[17px] text-[15px] text-[#171714]">
                    Rajesh Varma
                  </h3>
                  <p className="text-[12px] font-mono text-[#68665F]">
                    Lead Installer · Apex Auto Studio, Hyderabad
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80"
                  alt="Rajesh Varma"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-[rgba(23,23,20,0.08)]"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 2: Brand Orange Accent Card */}
          <TimelineContent
            animationNum={1}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[3] flex-[4] lg:h-fit lg:shrink-0 flex flex-col justify-between relative bg-[#F26522] text-white overflow-hidden rounded-xl border border-[#F26522] p-6 shadow-[0_4px_20px_rgba(242,101,34,0.18)]"
          >
            <div className="flex items-center gap-1 mb-4 text-white/90">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto">
              <p className="text-[14.5px] sm:text-[15px] leading-[1.6] text-white/95 font-medium">
                &ldquo;Outstanding hydrophobic finish. Water and road grime simply sheet off during monsoon highway driving.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5 border-t border-white/20 mt-5">
                <div>
                  <h3 className="font-semibold text-[16px] text-white">
                    Ananya Sen
                  </h3>
                  <p className="text-[12px] font-mono text-white/80">
                    BMW M3 Owner · Bengaluru
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
                  alt="Ananya Sen"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-white/30"
                />
              </div>
            </article>
          </TimelineContent>
        </div>

        {/* COLUMN 2 (Center Column: Architectural Dark Cards) */}
        <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-3.5 lg:gap-0 gap-3.5">
          {/* Card 3 */}
          <TimelineContent
            animationNum={2}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#171714] text-white overflow-hidden rounded-xl border border-[#262622] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-1 mb-3 text-[#F26522]">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto">
              <p className="text-[14px] sm:text-[14.5px] leading-[1.6] text-[#D8D6CE]">
                &ldquo;Their technical team in Vijayawada provided instant logistics support and calibration sheets for our plotters. Unmatched response time.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5 border-t border-white/10 mt-5">
                <div>
                  <h3 className="font-semibold text-[16px] text-white">
                    Vikram Malhotra
                  </h3>
                  <p className="text-[12px] font-mono text-[#A2A096]">
                    Director · Elite Detailers, Delhi NCR
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                  alt="Vikram Malhotra"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 4 */}
          <TimelineContent
            animationNum={3}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#171714] text-white overflow-hidden rounded-xl border border-[#262622] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-1 mb-3 text-[#F26522]">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto">
              <p className="text-[14px] sm:text-[14.5px] leading-[1.6] text-[#D8D6CE]">
                &ldquo;We replaced imported German brands with Trionyx 10H ceramic coating across our fleet. Gloss retention after six months is identical, at half the lead time.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5 border-t border-white/10 mt-5">
                <div>
                  <h3 className="font-semibold text-[16px] text-white">
                    Suresh Kothari
                  </h3>
                  <p className="text-[12px] font-mono text-[#A2A096]">
                    Fleet Manager · Grand Transports, Mumbai
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                  alt="Suresh Kothari"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 5 */}
          <TimelineContent
            animationNum={4}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#171714] text-white overflow-hidden rounded-xl border border-[#262622] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-1 mb-3 text-[#F26522]">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto">
              <p className="text-[14px] sm:text-[14.5px] leading-[1.6] text-[#D8D6CE]">
                &ldquo;Self-healing properties on the Trionyx TPU film are genuinely instantaneous under warm water or sunlight. The best scratch protection on the market.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5 border-t border-white/10 mt-5">
                <div>
                  <h3 className="font-semibold text-[16px] text-white">
                    Farhan Qureshi
                  </h3>
                  <p className="text-[12px] font-mono text-[#A2A096]">
                    Porsche 911 GT3 Owner · Pune
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80"
                  alt="Farhan Qureshi"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20"
                />
              </div>
            </article>
          </TimelineContent>
        </div>

        {/* COLUMN 3 */}
        <div className="h-full md:flex lg:flex-col lg:space-y-3.5 lg:gap-0 gap-3.5">
          {/* Card 6: Brand Orange Accent Card */}
          <TimelineContent
            animationNum={5}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-[#F26522] text-white overflow-hidden rounded-xl border border-[#F26522] p-6 shadow-[0_4px_20px_rgba(242,101,34,0.18)]"
          >
            <div className="flex items-center gap-1 mb-4 text-white/90">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto">
              <p className="text-[14.5px] sm:text-[15px] leading-[1.6] text-white/95 font-medium">
                &ldquo;Trionyx has been our central distribution partner for four years. Consistent batch quality and zero adhesive failure.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5 border-t border-white/20 mt-5">
                <div>
                  <h3 className="font-semibold text-[16px] text-white">
                    Meera Nambiar
                  </h3>
                  <p className="text-[12px] font-mono text-white/80">
                    Studio Founder · Precision Care, Kochi
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80"
                  alt="Meera Nambiar"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-white/30"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 7: Large Featured Warm Card */}
          <TimelineContent
            animationNum={6}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-[#FCFBF7] text-[#171714] overflow-hidden rounded-xl border border-[rgba(23,23,20,0.08)] p-6 shadow-[0_2px_10px_rgba(23,23,20,0.02)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#17171408_1px,transparent_1px),linear-gradient(to_bottom,#17171408_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>

            <div className="flex items-center gap-1 mb-4 text-[#F26522]">
              {'★'.repeat(5)}
            </div>

            <article className="mt-auto relative z-10">
              <p className="text-[15px] sm:text-[16px] leading-[1.65] font-normal text-[#171714]">
                &ldquo;The optical clarity of Trionyx Ultra Clear PPF on our supercar deliveries is flawless. No orange peel, no yellowing, and the warranty support gives our customers total confidence.&rdquo;
              </p>
              <div className="flex justify-between items-end pt-6 border-t border-[rgba(23,23,20,0.06)] mt-6">
                <div>
                  <h3 className="font-semibold text-[17px] text-[#171714]">
                    Aditya Singhania
                  </h3>
                  <p className="text-[12px] font-mono text-[#68665F]">
                    Managing Director · Autowerks, Kolkata
                  </p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80"
                  alt="Aditya Singhania"
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-xl object-cover border border-[rgba(23,23,20,0.08)]"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
      </div>

      {/* Subtle Architectural Baseline */}
      <div className="absolute border-b border-[rgba(23,23,20,0.08)] bottom-4 h-16 z-[2] md:w-full w-[90%] md:left-0 left-[5%] pointer-events-none">
        <div className="max-w-[1340px] mx-auto w-full h-full relative before:absolute before:-left-2 before:-bottom-2 before:w-4 before:h-4 before:bg-[#FCFBF7] before:shadow-sm before:border before:border-[rgba(23,23,20,0.12)] after:absolute after:-right-2 after:-bottom-2 after:w-4 after:h-4 after:bg-[#FCFBF7] after:shadow-sm after:border after:border-[rgba(23,23,20,0.12)]"></div>
      </div>
    </section>
  );
}

export default ClientFeedback;
