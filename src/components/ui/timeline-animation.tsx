"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "motion/react";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "article" | "span" | "section";
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: Variants;
  children?: React.ReactNode;
  className?: string;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  children,
  className = "",
  ...props
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const targetRef = timelineRef || localRef;
  const isInView = useInView(targetRef, { once: true, margin: "-10% 0px -10% 0px" });

  const defaultVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(8px)",
      y: 20,
      opacity: 0,
    },
  };

  const Component = (motion[as as keyof typeof motion] || motion.div) as any;

  return (
    <Component
      ref={localRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={customVariants || defaultVariants}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
