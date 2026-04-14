import imgHolder from "../assets/Games-filler.png";


export default function HomePage() {
    return (
        <div className="home-page">
            <image src="/src/assets/hero.png" alt="VibeGamer" className="home-image" />
            <h1 className="text-4xl font-bold pt-4">Welcome to Vibe Gamer!</h1>
            <p>Discover your next favorite game.</p>
            <img src={imgHolder} alt="Games coming soon" className=" mt-4 mb-4 object-cover w-full h-full" />
        </div>
    );
}