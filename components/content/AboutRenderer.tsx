"use client";

import { AboutBlock, AboutPage } from "@/lib/content-types";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function AboutRenderer({ data }: { data: AboutPage | null }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  if (!data) return null;

  return (
    <div className="bg-white" ref={ref}>
      {/* Hero Section - Parallax & Cinematic */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          {data.hero.imageUrl ? (
            <Image
              src={data.hero.imageUrl}
              alt={data.hero.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block text-accent-gold text-xs md:text-sm font-semibold uppercase tracking-[0.3em] mb-4"
          >
            {data.hero.subtitle}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight"
          >
            {data.hero.title}
          </motion.h1>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="py-20 md:py-32 space-y-20 md:space-y-32">
        {data.blocks.map((block, idx) => (
          <Block key={idx} block={block} index={idx} />
        ))}
      </div>
    </div>
  );
}

function Block({ block, index }: { block: AboutBlock; index: number }) {
  switch (block.type) {
    case "text":
      return (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          {block.heading && (
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-8">
              {block.heading}
            </h2>
          )}
          {block.body && (
            <div
              className="text-lg md:text-xl text-neutral-600 leading-relaxed font-light whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: block.body }} // Allow basic HTML if needed from admin
            />
          )}
        </motion.section>
      );

    case "stats":
      return (
        <section className="bg-neutral-50 py-24 border-y border-neutral-100">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
              {block.items?.map((item, i) => (
                <StatsItem key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

function StatsItem({
  item,
  index,
}: {
  item: { label: string; value: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="text-4xl md:text-6xl font-serif text-neutral-900 mb-3 group-hover:text-primary transition-colors duration-300">
        {item.value}
      </div>
      <div className="h-px w-8 bg-accent-gold mx-auto mb-4 opacity-50 group-hover:w-16 transition-all duration-300" />
      <div className="text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-500 font-medium">
        {item.label}
      </div>
    </motion.div>
  );
}
