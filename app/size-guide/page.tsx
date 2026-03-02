import { InfoPage } from "@/components/layout/InfoPage";

export default function SizeGuidePage() {
  return (
    <InfoPage title="Size Guide" subtitle="Find Your Perfect Fit">
      <p>
        Our cuts are designed to be modest yet flattering, with a focus on comfort and elegance. Please refer to the chart below for general measurements.
      </p>
      
      <div className="not-prose mt-12 overflow-x-auto">
        <table className="w-full text-sm text-left text-primary/70 border-collapse">
          <thead className="bg-bg-secondary text-primary font-serif uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4 border border-accent-subtle">Size</th>
              <th className="p-4 border border-accent-subtle">Bust (in)</th>
              <th className="p-4 border border-accent-subtle">Waist (in)</th>
              <th className="p-4 border border-accent-subtle">Hips (in)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            <tr>
              <td className="p-4 border border-accent-subtle font-medium text-primary">XS</td>
              <td className="p-4 border border-accent-subtle">32</td>
              <td className="p-4 border border-accent-subtle">24</td>
              <td className="p-4 border border-accent-subtle">34</td>
            </tr>
            <tr>
              <td className="p-4 border border-accent-subtle font-medium text-primary">S</td>
              <td className="p-4 border border-accent-subtle">34</td>
              <td className="p-4 border border-accent-subtle">26</td>
              <td className="p-4 border border-accent-subtle">36</td>
            </tr>
            <tr>
              <td className="p-4 border border-accent-subtle font-medium text-primary">M</td>
              <td className="p-4 border border-accent-subtle">36</td>
              <td className="p-4 border border-accent-subtle">28</td>
              <td className="p-4 border border-accent-subtle">38</td>
            </tr>
            <tr>
              <td className="p-4 border border-accent-subtle font-medium text-primary">L</td>
              <td className="p-4 border border-accent-subtle">38</td>
              <td className="p-4 border border-accent-subtle">30</td>
              <td className="p-4 border border-accent-subtle">40</td>
            </tr>
            <tr>
              <td className="p-4 border border-accent-subtle font-medium text-primary">XL</td>
              <td className="p-4 border border-accent-subtle">40</td>
              <td className="p-4 border border-accent-subtle">32</td>
              <td className="p-4 border border-accent-subtle">42</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-secondary/60 mt-6 italic">
        *Measurements refer to body size, not garment dimensions. For loose-fit items (like Kurtis), allow 1-2 inches of ease.
      </p>
    </InfoPage>
  );
}
