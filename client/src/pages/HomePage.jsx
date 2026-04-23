import imgHolder from "../assets/Games-filler.png";
import logo from "../assets/logo2.jpg";
import { useState, useEffect } from "react";
import DisplayGames from "../components/DisplayGames";
import SectionCard from "../components/layout/SectionCard";
import { use } from "react";
import { fetchFeaturedGames, fetchRAWGGames } from "../utilities";
import { Link } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";


export default function HomePage() {
    const [featuredGames, setFeaturedGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    
    useEffect(() => {
        async function loadFeaturedGames() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetchFeaturedGames(page);
                setFeaturedGames(data.results || []);
                setCount(data.count || 0);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadFeaturedGames();
    }, [page]);

    const handlePCGamesClick = () => {
        navigate("/platform/pc");
    };

    return (
        <section className="home-page pt-2 pb-8">
            <div className="bg-image bg-cover bg-center text-white text-center mb-8 rounded-sm w-full mt-3 h-130" style={{ backgroundImage: `url(${logo})` }}>
            </div>
            <h1 className="text-4xl font-bold pb-4 text-white text-center">Discover Your Next Favorite Game!</h1>
            <Button variant="gradient" color="purple" className="mx-auto mb-8 hover:animate-bounce">
                <Link to="/auth" className="block w-full h-full">
                    Sign In or Sign Up to Get Started
                </Link>
            </Button>
            <div className="bg-image bg-cover bg-center rounded-sm w-full mt-3 h-130" style={{ backgroundImage: `url(${imgHolder})` }}>
                <Link to="/new" className="block w-full h-full flex items-center justify-center">
                    <span className="text-center mb-8 text-5xl font-semibold text-purple-300 hover:text-purple-500 bg-black bg-opacity-50">Explore New Releases</span>
                </Link>
            </div>
            <Button variant="gradient" color="purple" className="mx-auto mt-8 mb-8 hover:animate-bounce text-xl">
                <Link to="/platform/pc" className="block w-full h-full text-white text-xl text-center">
                    Browse PC Games
                </Link>
            </Button>
            <SectionCard title="Featured Games">
                <DisplayGames 
                games={featuredGames} 
                isLoading={isLoading} 
                error={error} />
            </SectionCard>
        </section>
    );
}

