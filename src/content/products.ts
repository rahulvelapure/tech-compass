import type { Product } from "./types";

/**
 * DEVELOPMENT SAMPLE DATA ONLY.
 *
 * Every entry is marked `sample: true` and is filtered out of anything the
 * site renders as content. It exists so the product/comparison components can
 * be developed and reviewed without inventing published claims about real
 * hardware. Replace with researched entries before publishing a buying guide.
 */
export const sampleProducts: Product[] = [
  {
    id: "sample-laptop-a",
    name: "Sample Laptop A",
    brand: "Sample Brand",
    category: "laptops",
    specs: [
      { label: "Display", value: "14-inch, 2880 x 1800" },
      { label: "Memory", value: "16 GB, soldered" },
      { label: "Storage", value: "512 GB NVMe, replaceable" },
      { label: "Ports", value: "2x USB-C, 1x USB-A, HDMI" },
    ],
    pros: ["Serviceable storage", "Full-size keyboard travel"],
    cons: ["Memory is not upgradeable", "Single fan under sustained load"],
    bestFor: "Placeholder entry used while building the product component.",
    notFor: "Any real purchasing decision.",
    reviewStatus: "research-based",
    sample: true,
  },
];

export function publishedProducts(all: Product[] = sampleProducts): Product[] {
  return all.filter((p) => !p.sample);
}
