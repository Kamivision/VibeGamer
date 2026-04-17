export default function DisplayNew({
  games,
  count,
  isLoading,
  errorMessage,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
}) {
  if (isLoading) {
    return <p className="text-lg">Loading new releases...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>;
  }

  if (!games.length) {
    return <p>No new releases found.</p>;
  }

  //DON'T FORGET! Move "Cards" to GameCard component. You only built the logic here to test the API connection and be done for today. THIS IS NOT THE FINAL DESIGN.
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">{count} games found</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <article
            key={game.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={game.background_image}
              alt={game.name}
              className="h-48 w-full object-cover"
            />

            <div className="space-y-3 p-4">
              <h2 className="text-xl font-semibold">{game.name}</h2>

              <p className="text-sm text-gray-600">
                Released: {game.released || "Unknown"}
              </p>

              <p className="text-sm text-gray-600">
                Rating: {game.rating || "N/A"}
              </p>

              <p className="text-sm text-gray-600">
                Genres: {game.genres?.join(", ") || "Unknown"}
              </p>

              <p className="text-sm text-gray-600">
                Platforms: {game.platforms?.join(", ") || "Unknown"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className="rounded-md bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}