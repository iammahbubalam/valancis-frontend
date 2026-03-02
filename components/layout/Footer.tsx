"use client";

import { Facebook, Instagram, Youtube } from "lucide-react";

import { Container } from "@/components/ui/Container";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FooterSection, SiteConfig } from "@/lib/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TikTok = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SocialIcon = ({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) => {
  switch (platform.toLowerCase()) {
    case "facebook":
    case "fb":
      return <Facebook className={className} />;
    case "instagram":
      return <Instagram className={className} />;
    case "youtube":
      return <Youtube className={className} />;
    case "tiktok":
      return <TikTok className={className} />;
    default:
      return null;
  }
};

interface FooterProps {
  siteConfig: SiteConfig;
  footerSections: FooterSection[];
}

export function Footer({ siteConfig, footerSections }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#f9f8f6] pt-12 md:pt-20 pb-0 text-primary border-t border-primary/5 overflow-hidden relative">
      <Container>
        <div className="flex flex-col items-start gap-10 md:grid md:grid-cols-4 md:gap-8 mb-20 text-left">
          {/* Brand Column - Ultra-Refined Left Alignment on Mobile */}
          <div className="w-full md:col-span-1 flex flex-col items-start gap-5">
            {/* Branding Block: Single line for Logo+Name, Aligned Description below */}
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 md:h-8 md:w-8">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-serif text-xl md:text-xl font-bold uppercase tracking-[0.15em] text-primary">
                  {siteConfig.name}
                </span>
              </div>
              <p className="text-sm md:text-base leading-tight text-secondary/60 font-medium italic antialiased ml-0.5">
                {siteConfig.description}
              </p>
            </div>

            {/* Social Links - Compact Row */}
            {siteConfig.socials && siteConfig.socials.length > 0 && (
              <div className="flex items-center justify-start gap-4">
                {siteConfig.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white border border-primary/5 text-primary/30 hover:text-primary hover:border-primary/20 transition-all duration-300 hover:scale-110 shadow-sm"
                    aria-label={social.platform}
                  >
                    <SocialIcon
                      platform={social.platform}
                      className="w-3 h-3"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Links Columns - 3-column horizontal grid below brand on mobile */}
          <div className="w-full md:col-span-3 grid grid-cols-3 gap-x-4 gap-y-10 md:gap-8 mt-2 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-primary/5">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col items-start">
                <h4 className="font-serif text-[9px] md:text-sm uppercase tracking-wider mb-5 text-primary font-semibold">
                  {section.title}
                </h4>
                <ul className="space-y-3.5 text-[10px] md:text-sm text-secondary/70 font-light flex flex-col items-start">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="hover:text-primary transition-colors text-left relative group inline-block"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent-gold transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Giant Footer Branding */}
        <div className="w-full flex justify-center border-t border-primary/5 pt-12 pb-6 overflow-hidden relative">
          <BrandLogo
            className="w-[90vw] h-auto text-primary"
            animated={true}
            variant="draw"
            duration={2.5}
            repeatOnScroll={true}
            repeatInterval={7000}
          />
        </div>

        <div className="py-8 flex justify-center items-center text-[10px] uppercase tracking-widest text-secondary/50">
          <p>{siteConfig.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
