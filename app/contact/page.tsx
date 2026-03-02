import { InfoPage } from "@/components/layout/InfoPage";
import { SITE_CONFIG } from "@/lib/data";

export default function ContactPage() {
  return (
    <InfoPage title="Contact Us" subtitle="We are here to help">
      <p>
        For inquiries regarding our collections, or if you need assistance with your order, please do not hesitate to contact our concierge team.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mt-12 border-t border-primary/10 pt-8">
        <div>
          <h3 className="font-serif text-lg mb-2">Email Us</h3>
          <p className="font-light text-secondary">{SITE_CONFIG.contact.email}</p>
        </div>
        <div>
           <h3 className="font-serif text-lg mb-2">Call Us</h3>
           <p className="font-light text-secondary">{SITE_CONFIG.contact.phone}</p>
        </div>
        <div>
           <h3 className="font-serif text-lg mb-2">Visit Us</h3>
           <p className="font-light text-secondary">{SITE_CONFIG.contact.address}</p>
        </div>
        <div>
           <h3 className="font-serif text-lg mb-2">Opening Hours</h3>
           <p className="font-light text-secondary">Mon - Sat: 10am - 8pm<br/>Friday: 4pm - 8pm</p>
        </div>
      </div>
    </InfoPage>
  );
}
