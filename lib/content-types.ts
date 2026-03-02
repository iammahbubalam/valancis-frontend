export interface GlobalSettings {
  branding: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
  };
  contact: {
    supportEmail: string;
    salesEmail: string;
    phonePrimary: string;
    phoneSecondary: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      zip: string;
      country: string;
      mapUrl: string;
    };
  };
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultOgImage: string;
  };
}

export type AboutBlockType = "text" | "image_split" | "stats";

export interface AboutStatsItem {
  label: string;
  value: string;
}

export interface AboutBlock {
  type: AboutBlockType;
  heading?: string;
  body?: string;
  position?: "left" | "right";
  imageUrl?: string;
  caption?: string;
  items?: AboutStatsItem[];
}

export interface AboutPage {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  blocks: AboutBlock[];
}

export interface PolicySection {
  heading: string;
  content?: string;
  listItems?: string[];
}

export interface PolicyPage {
  sections: PolicySection[];
  lastUpdated: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface FAQPage {
  items: FAQItem[];
}
