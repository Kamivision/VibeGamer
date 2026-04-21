import imgHolder from "../assets/Games-filler.png";
import BannerCard from "../components/layout/BannerCard";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";
import DisplayGames from "../components/DisplayGames";
import { useState, useEffect } from "react";
import { fetchLibrary } from "../utilities";

export default function UserLibrary() {
  const [library, setLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function normalizeLibraryGame(savedItem) {
    const game = savedItem?.game || {};
    const metadata = game?.metadata || {};

    return {
      id: Number(game.external_id) || game.id,
      libraryGameId: game.id,
      savedId: savedItem.id,
      name: game.title || "Unknown",
      released: game.released_at || "Unknown",
      rating: metadata.rawg_rating || "N/A",
      background_image: game.image_url || imgHolder,
      genres: Array.isArray(game.tags) ? game.tags : [],
      platforms: Array.isArray(metadata.platforms) ? metadata.platforms : [],
      slug: game.slug || "",
    };
  }

  useEffect(() => {
    async function loadLibrary() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await fetchLibrary();
        const normalizedLibrary = Array.isArray(data)
          ? data.map((savedItem) => normalizeLibraryGame(savedItem))
          : [];
        setLibrary(normalizedLibrary);
      } catch (error) {
        if (error?.response?.status === 401) {
          setErrorMessage("Please sign in to view your library.");
        } else {
          setErrorMessage("Failed to load your library.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadLibrary();
  }, []);

  function handleRemoveFromLibrary(libraryGameId) {
    setLibrary((currentLibrary) =>
      currentLibrary.filter((game) => game.libraryGameId !== libraryGameId)
    );
  }

  return (
    <PageShell>
      <BannerCard
        title="User Library"
        imageSrc={imgHolder}
        imageAlt="library banner"
      >
        <p>Track saved games.</p>
      </BannerCard>

      <SectionCard title="Search / Filter">
        <p>This is a placeholder for search and filter controls.</p>
      </SectionCard>

      <SectionCard title="Your Saved Games">
        <DisplayGames
          games={library}
          count={library.length}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onGameRemove={handleRemoveFromLibrary}
        />
      </SectionCard>

      <SectionCard title="Your Owned Games">
        <p>This is a placeholder for the user's owned games.</p>
      </SectionCard>
    </PageShell>
  );
}