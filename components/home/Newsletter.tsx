"use client";

import { useState } from "react";

import { Container, Section } from "@/components/ui/Container";

import { subscribeToNewsletter } from "@/lib/data";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <Section className="bg-[#f2f0eb] border-t border-primary/5 py-0 md:py-0"> 
    {/* Setting py-0 to allow full height image split */}
      <div className="flex flex-col md:flex-row h-auto md:h-[600px] w-full">
         
         {/* Left: Image */}
         <div className="w-full md:w-1/2 relative min-h-[400px]">
            {/* Texture Overlay - CSS Noise */}
            <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
               }} 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
         </div>

         {/* Right: Content */}
         <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 relative overflow-hidden">
             
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} 
             />

             <div className="w-full max-w-md relative z-10">
                <span className="text-xs uppercase tracking-[0.3em] text-accent-gold mb-6 block">The Inner Circle</span>
                <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6 leading-tight">
                  Join the list for <br/> 
                  <span className="italic text-secondary">exclusive access.</span>
                </h2>
                <p className="text-secondary/80 font-light mb-10 leading-relaxed">
                   Be the first to know about new arrivals, private sales, and stories from the atelier.
                </p>
                
                {status === "success" ? (
                    <div className="p-6 bg-green-50 border border-green-200 text-green-800 text-sm font-serif italic text-center rounded-sm mt-8">
                       {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full relative mt-8 group">
                        <input 
                          type="email" 
                          placeholder="Your email address" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={status === "loading"}
                          className="w-full bg-transparent border-b border-primary/20 py-4 text-left text-lg outline-none placeholder:text-primary/30 focus:border-primary transition-colors text-primary pl-2 disabled:opacity-50"
                        />
                        <button 
                          type="submit"
                          disabled={status === "loading"}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-primary opacity-50 hover:opacity-100 hover:text-accent-gold transition-all disabled:opacity-30"
                        >
                          {status === "loading" ? "Subscribing..." : "Subscribe"}
                        </button>
                    </form>
                )}

                {status === "error" && (
                    <p className="text-red-500 text-xs mt-2 text-center absolute -bottom-6 w-full">{message}</p>
                )}

                <p className="text-[10px] uppercase tracking-widest text-secondary/40 mt-12 opacity-60">
                   No spam. Just beauty.
                </p>
             </div>
         </div>

      </div>
    </Section>
  );
}
