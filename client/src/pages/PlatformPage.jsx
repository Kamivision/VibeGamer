import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRAWGGames } from "../utilities";
import PageShell from "../components/layout/PageShell";
import DisplayGames from "../components/DisplayGames";


export default function PlatformPage() {
  // Get the platform from the URL (e.g., 'pc', 'xbox', etc.)
  const { platform } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRAWGGames("", "", platform, page);
        setGames(data.results || []);
        setCount(data.count || 0);
        setNext(data.next || null);
        setPrevious(data.previous || null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, [platform, page]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading games: {error.message}</p>;

  return (
    <PageShell title={`${platform ? platform.toUpperCase() : ""} Games`} subtitle={`Browse ${platform || ""} games.`}>
      <DisplayGames games={games} count={count} />
    </PageShell>
  );
}