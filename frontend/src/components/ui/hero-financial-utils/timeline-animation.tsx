import React from 'react';
import { motion } from 'framer-motion';

interface TimelineAnimationProps {
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  animationNum?: number;
  className?: string;
  as?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const TimelineAnimation: React.FC<TimelineAnimationProps> = ({
  timelineRef,
  animationNum = 1,
  className,
  as = 'div',
  children,
  ...props
}) => {
  // Dynamically resolve Framer Motion element tag
  const MotionComponent = (motion as any)[as] || motion.div;

  // Calculate staggered delay based on animation rank
  const delay = animationNum * 0.12;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
