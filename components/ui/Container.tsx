import React, { forwardRef } from "react";
import clsx from "clsx";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({ 
  children, 
  className,
  as: Component = "div" 
}, ref) => {
  return (
    <Component 
      ref={ref}
      className={clsx(
        "mx-auto w-full max-w-[1440px]",
        "px-4 md:px-6 lg:px-8", // Responsive horizontal padding
        className
      )}
    >
      {children}
    </Component>
  );
});

Container.displayName = "Container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(({
  children,
  className,
  id
}, ref) => {
  return (
    <section 
      ref={ref}
      id={id}
      className={clsx(
        "w-full",
        "py-16 md:py-32", // Mobile: 64px (16*4), Desktop: 128px (32*4) ~= 120px
        className
      )}
    >
      {children}
    </section>
  );
});

Section.displayName = "Section";
