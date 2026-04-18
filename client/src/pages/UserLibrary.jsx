import imgHolder from "../assets/Games-filler.png";
import HeroBannerCard from "../components/layout/HeroBannerCard";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";

export default function UserLibrary() {
  return (
    <PageShell>
      <HeroBannerCard
        title="User Library"
        imageSrc={imgHolder}
        imageAlt="library banner"
      >
        <p>This is a placeholder for the helper text.</p>
      </HeroBannerCard>

      <SectionCard title="Search / Filter">
        <p>This is a placeholder for search and filter controls.</p>
      </SectionCard>

      <SectionCard title="Your Saved Games">
        <p>This is a placeholder for the user's saved games.</p>
      </SectionCard>

      <SectionCard title="Your Owned Games">
        <p>This is a placeholder for the user's owned games.</p>
      </SectionCard>
    </PageShell>
  );
}