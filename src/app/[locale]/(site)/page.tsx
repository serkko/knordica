import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { WhyKnordica } from "@/components/home/WhyKnordica";
import { ZonesSection } from "@/components/home/ZonesSection";
import { MapPreview } from "@/components/home/MapPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { MarketBlog } from "@/components/home/MarketBlog";
import { FinalCTA } from "@/components/home/FinalCTA";

import { getProperties } from "@/lib/queries/properties";
import { getFeaturedZones } from "@/lib/queries/zones";
import { getBlogPosts } from "@/lib/queries/blog";
import { MOCK_TESTIMONIALS, SITE_STATS } from "@/lib/mock-data";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  // Parallel server-side fetching
  const [propertiesResult, zones, blogPosts] = await Promise.all([
    getProperties({ page: 1, per_page: 50 }), // Load a good amount of mock properties to check featured flags
    getFeaturedZones(),
    getBlogPosts(locale as Locale),
  ]);

  // Filter featured properties for the featured grid section (max 3)
  const featuredProperties = propertiesResult.data
    .filter((p) => p.featured)
    .slice(0, 3);

  return (
    <>
      <Hero zones={zones} stats={SITE_STATS} />
      <FeaturedProperties properties={featuredProperties} />
      <WhyKnordica />
      <ZonesSection zones={zones} properties={propertiesResult.data} />
      <MapPreview />
      <Testimonials testimonials={MOCK_TESTIMONIALS} />
      <MarketBlog posts={blogPosts} />
      <FinalCTA />
    </>
  );
}
