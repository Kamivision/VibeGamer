import imgHolder from "../assets/Games-filler.png";
import { Navigate, useOutletContext } from "react-router-dom";
import {
  Card, CardBody, CardHeader,
  Typography,
} from "@material-tailwind/react";


export default function UserLibrary() {
  return (
    <section className="container mx-auto px-8 py-10">
      
      <Card
        shadow={false}
        className="border border-gray-300 rounded-2xl bg-violet-500 mt-5"
      >
        <h1 className="text-4xl font-bold">User Library</h1>
        <CardHeader shadow={false} className="mt-5 h-70 rounded-lg">
          <img
            src={imgHolder}
            alt="dark"
            className="h-full w-full object-cover object-center"
          />
        </CardHeader>
        <CardBody className = "bg-white">
          <div className="flex flex-wrap items-center justify-between gap-6 lg:gap-0">
            <Typography>
              This is a place holder for the helper text
            </Typography>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Search/Filter:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder for search and filter controls. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Your Saved Games:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder the user's saved games. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Your Owned Games:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder the user's owned games. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>   
    </section>
  );
}