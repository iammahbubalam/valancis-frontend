"use client";

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission would go here
    alert("Thank you. Our concierge will reach out shortly.");
  };

  const contactInfo = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Opening Hours",
      value: "24/7 Support",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "Vatara, Badda, Dhaka 1212",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+88 01716131573",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "valancis.store@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-primary pt-32 pb-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center lg:text-left"
          >
            <h1 className="font-serif text-4xl md:text-6xl mb-6 tracking-tight">The Concierge</h1>
            <p className="text-primary/60 font-utility font-light text-lg md:text-xl max-w-2xl leading-relaxed">
              Experience the personalized service of Valancis. Whether you have a bespoke request or need assistance with your order, we are here for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              <div className="space-y-8">
                <h2 className="uppercase tracking-[0.2em] text-xs font-bold text-primary/40 border-b border-accent-subtle pb-4">
                  Direct Assistance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-3 text-primary/40">
                        {info.icon}
                        <span className="uppercase tracking-widest text-[10px] font-bold">{info.label}</span>
                      </div>
                      <p className="font-serif text-lg md:text-xl">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-accent-subtle/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-primary/60">
                  <MessageSquare size={20} />
                  <h3 className="font-serif text-xl">Speak with us</h3>
                </div>
                <p className="text-sm text-primary/60 leading-relaxed font-light">
                  Our team is available 24/7 to provide guidance on sizes, fabrics, or order tracking.
                  Experience the quiet luxury of dedicated support.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="uppercase tracking-widest text-[10px] font-bold text-primary/40">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-b border-accent-subtle py-3 outline-none focus:border-primary transition-colors font-light"
                      placeholder="Jane Doe"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="uppercase tracking-widest text-[10px] font-bold text-primary/40">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-transparent border-b border-accent-subtle py-3 outline-none focus:border-primary transition-colors font-light"
                      placeholder="jane@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[10px] font-bold text-primary/40">Subject</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-transparent border-b border-accent-subtle py-3 outline-none focus:border-primary transition-colors font-light"
                    placeholder="Bespoke Order / Order Inquiry"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[10px] font-bold text-primary/40">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-accent-subtle py-3 outline-none focus:border-primary transition-colors font-light resize-none"
                    placeholder="How can we assist you today?"
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="group flex items-center gap-3 px-10 py-5 bg-primary text-canvas rounded-full hover:scale-[1.02] transition-all duration-300"
                >
                  Send Message <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
}
