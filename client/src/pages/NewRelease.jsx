import DisplayNew from "../components/DisplayNew";
import { fetchNewReleases } from "../utilities";
import { useState, useEffect } from "react";


export default function NewRelease() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [next, setNext] = useState(null);
    const [previous, setPrevious] = useState(null);


    useEffect(() => {
        async function loadNewReleases() {
            setIsLoading(true);
            setError(null);

            try {
            const data = await fetchNewReleases(page);
            setGames(data.results || []); 
            setCount(data.count || 0);
            setNext(data.next || null);
            setPrevious(data.previous || null);
            } catch (error) {
            setError(console.error("Failed to fetch games:", error));
            
            } finally {
            setIsLoading(false);
            }
        }
    loadNewReleases();
    }, [page]);

    return (
        <section className="container mx-auto px-8 py-10">
            <h1 className="text-4xl font-bold">New Release</h1>
            <DisplayNew 
            games={games} 
            count={count} 
            isLoading={isLoading} 
            errorMessage={error} 
            hasNextPage={!!next} 
            hasPreviousPage={!!previous} 
            onNextPage={() => setPage((prev) => prev + 1)} 
            onPreviousPage={() => setPage((prev) => prev - 1)} 
            />
        </section>
    );
}