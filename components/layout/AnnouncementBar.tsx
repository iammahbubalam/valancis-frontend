"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";
import Link from "next/link";

interface AnnouncementData {
  message: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * AnnouncementTicker - News channel style scrolling text bar
 * L9: Renders below hero section, text scrolls continuously, pauses on hover
 */
export function AnnouncementTicker() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(getApiUrl("/content/announcement_bar"));
        if (res.ok) {
          const data = await res.json();
          // Check isActive from content first, fallback to root isActive, then default to true
          // The backend Generic Content handler persists isActive inside the JSON content, 
          // but the separate is_active column might not be updated.
          const isActive = data.content?.isActive ?? data.isActive ?? true;

          if (isActive && data.content?.message) {
            setAnnouncement({
              message: data.content.message,
              linkText: data.content.linkText,
              linkUrl: data.content.linkUrl,
              backgroundColor: data.content.backgroundColor || "#1a1a2e",
              textColor: data.content.textColor || "#ffffff",
            });
          }
        }
      } catch (err) {
        console.debug("Failed to fetch announcement:", err);
      }
    };

    fetchAnnouncement();
  }, []);

  if (!announcement) return null;

  // Create repeated text for seamless scrolling
  const tickerContent = `${announcement.message} ${announcement.linkText ? `— ${announcement.linkText}` : ""} ★ `;

  return (
    <div
      className="relative overflow-hidden py-2.5"
      style={{
        backgroundColor: announcement.backgroundColor,
        color: announcement.textColor,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* L9: Marquee effect using CSS animation */}
      <div
        className={`flex whitespace-nowrap ${isPaused ? "animate-pause" : "animate-marquee"}`}
        style={{
          animation: isPaused ? "none" : "marquee 30s linear infinite",
        }}
      >
        {/* Repeat content multiple times for seamless loop */}
        {[...Array(10)].map((_, i) => (
          <span key={i} className="inline-flex items-center gap-4 mx-4">
            <span className="text-sm font-medium tracking-wide">
              {announcement.message}
            </span>
            {announcement.linkText && announcement.linkUrl && (
              <Link
                href={announcement.linkUrl}
                className="text-sm font-semibold underline hover:no-underline transition-colors"
                style={{ color: announcement.textColor }}
              >
                {announcement.linkText}
              </Link>
            )}
            <span className="text-xs opacity-50">★</span>
          </span>
        ))}
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
