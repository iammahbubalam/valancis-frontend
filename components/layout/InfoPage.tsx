import { Container } from "@/components/ui/Container";

interface InfoPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function InfoPage({ title, subtitle, children }: InfoPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg-primary text-primary">
      <Container className="max-w-3xl">
        <div className="py-12 md:py-16 text-center">
           <h1 className="font-serif text-3xl md:text-5xl text-primary mb-4">{title}</h1>
           {subtitle && <p className="text-secondary tracking-widest uppercase text-xs">{subtitle}</p>}
        </div>
        <div className="prose prose-stone prose-headings:font-serif prose-headings:font-normal prose-p:font-light prose-p:text-secondary/90 prose-a:text-primary hover:prose-a:text-accent-gold mx-auto">
          {children}
        </div>
      </Container>
    </div>
  );
}
