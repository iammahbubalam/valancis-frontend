import JsonLd from "./JsonLd";
import { SiteConfig } from "@/lib/data";
import { env } from "@/lib/env";

interface OrganizationSchemaProps {
  siteConfig: SiteConfig;
}

export function OrganizationSchema({ siteConfig }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: env.NEXT_PUBLIC_APP_URL,
    logo: `${env.NEXT_PUBLIC_APP_URL}/assets/logo_valancis.png`,
    sameAs: siteConfig.socials.map((s) => s.url).filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      contactType: "Customer Service",
      areaServed: "BD",
      availableLanguage: ["en", "bn"],
    },
  };

  return <JsonLd data={schema} />;
}
