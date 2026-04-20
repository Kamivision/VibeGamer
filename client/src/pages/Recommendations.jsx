import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";
import GameCard from "../components/GameCard";
import { fetchRecommendedGames } from "../utilities";

export default function Recommendations() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRecommendedGames();

        if (!isMounted) return;

        setGames(Array.isArray(data?.results) ? data.results : []);
        setStrategy(typeof data?.strategy === "string" ? data.strategy : "");
      } catch (err) {
        if (!isMounted) return;
        setError("We could not load your recommendations right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageShell
      title="Your Game Recommendations"
      subtitle="Based on your gamer profile, here are some games we think you'll love."
    >
      <SectionCard title="Recommended For You">
        {loading ? <p>Loading recommendations...</p> : null}

        {!loading && error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && strategy ? (
          <p className="mb-4 text-sm text-gray-600">Recommendation mode: {strategy}</p>
        ) : null}

        {!loading && !error && games.length === 0 ? (
          <p>No recommendations yet. Try updating your profile tags and quiz results.</p>
        ) : null}

        {!loading && !error && games.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id || game.name} game={game} />
            ))}
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}