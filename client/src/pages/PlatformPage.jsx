import { useEffect, useState } from "react";
import { fetchRAWGGames } from "../utilities";
import PageShell from "../components/layout/PageShell";
import DisplayGames from "../components/DisplayGames";



export default function PlatformPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("pc");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchGameByPlatform(platform, page);
        setGames(data.results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [platform]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading games: {error.message}</p>;

  return (
    <PageShell title={`${platform.toUpperCase()} Games`} subtitle={`Browse ${platform} games.`}>
      <DisplayGames games={games} />
    </PageShell>
  );
}