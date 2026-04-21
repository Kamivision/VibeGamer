import PageShell from "../components/layout/PageShell";
import DisplayDetail from "../components/DisplayDetail";
import { fetchGameDetails } from "../utilities";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


export default function GameDetail() {
  const [game, setGame] = useState(null);
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const developers = Array.isArray(game?.developers)
    ? game.developers
        .map((developer) => {
          if (typeof developer === "string") {
            return developer;
          }

          if (developer && typeof developer === "object") {
            return developer.name || null;
          }

          return null;
        })
        .filter(Boolean)
    : [];

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!id) {
        setError("Invalid game ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setGame(null);

      try {
        const gameDetails = await fetchGameDetails(id);
        if (!isActive) {
          return;
        }

        setGame(gameDetails);
      } catch (err) {
        if (!isActive) {
          return;
        }

        const errorMessage =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load game details. Please try again.";

        setError(errorMessage);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [id, retryCount]);

  if (loading) {
    return <div>Loading...</div>;
  }

  else if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
          Try Again
        </button>
      </div>
    );
  }

  else if (!game) {
    return <div>No game details found.</div>;
  }
  else {
    return (
      <PageShell title={`${game.name}`} subtitle={`Developer: ${developers.join(", ") || "Unknown"}`}>
        <DisplayDetail game={game} />
      </PageShell>
    );
  }
}