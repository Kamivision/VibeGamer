import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { fetchVibeExplanation } from "../utilities";


export default function GameCard({ game, user }) {
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  async function handleWhyClick() {
    if (explanation) return;
    setLoadingExplanation(true);
    try {
      const text = await fetchVibeExplanation({
        gameName: game.name,
        genres: game.genres || [],
        personality: user?.personality || "",
        personalityTags: user?.personality_tags || [],
      });
      setExplanation(text);
    } catch {
      setExplanation("Could not load explanation right now.");
    } finally {
      setLoadingExplanation(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader floated={false} shadow={false} className="m-0 rounded-none">
        <img
          src={game.background_image}
          alt={game.name}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5">{game.name}</Typography>
        <Typography className={cardStyle.desc}>Released: {game.released || "Unknown"}</Typography>
        <Typography className={cardStyle.desc}>Rating: {game.rating || "N/A"}</Typography>
        <Typography className={cardStyle.desc}>Genres: {game.genres?.join(", ") || "Unknown"}</Typography>
        <Typography className={cardStyle.desc}>Platforms: {game.platforms?.join(", ") || "Unknown"}</Typography>
        {explanation ? (
          <Typography className="mt-2 text-sm italic text-purple-700">{explanation}</Typography>
        ) : null}
      </CardBody>
      <CardFooter className={cardStyle.footer}>
        <Button
          size="sm"
          className={explanation ? cardStyle.btnActive : cardStyle.btn}
          onClick={handleWhyClick}
          disabled={loadingExplanation || !!explanation}
        >
          {loadingExplanation ? "..." : "Why?"}
        </Button>
        <Button size="sm" className={cardStyle.btn}>More</Button>
        <Button size="sm" className={cardStyle.btn}>Add to Library</Button>
      </CardFooter>
    </Card>
  );
}


const cardStyle = {
  desc: "text-sm text-gray-600",
  btn: "rounded-md bg-purple-500 px-4 py-2 disabled:opacity-50",
  btnActive: "rounded-md bg-cyan-600 px-4 py-2 disabled:opacity-50",
  footer: "pt-0 flex justify-center items-center gap-2",
};
