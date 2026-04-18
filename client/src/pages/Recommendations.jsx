import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";

export default function Recommendations() {
  return (
    <PageShell
      title="Your Game Recommendations"
      subtitle="Based on your gamer profile, here are some games we think you'll love."
    >
      <SectionCard title="Recommended For You">
        <p>Placeholder for recommended games list.</p>
      </SectionCard>
    </PageShell>
  );
}