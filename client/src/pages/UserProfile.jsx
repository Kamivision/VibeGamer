import React from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import {
  Card, CardBody, CardHeader,
  Typography,
} from "@material-tailwind/react";
import { UserCircleIcon as DefaultAvatar } from "@heroicons/react/24/outline";
import logoImage from "../assets/logo.jpg";

export default function UserProfile() {
  const { user } = useOutletContext();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="container mx-auto px-8 py-10">
      <Card
        shadow={false}
        className="border border-gray-300 rounded-2xl bg-violet-500"
      >
        <h1 className="flex items-center justify-center text-4xl font-bold text-yellow-300 text-shadow-lg">
            {user.username}'s Profile
        </h1>
        <CardHeader shadow={false} className="mt-5 h-70 rounded-lg">
          
          <img
            src={logoImage}
            alt="dark"
            className="h-full w-full object-cover object-center"
          />
        </CardHeader>
        <CardBody className = "bg-white">
          <div className="flex flex-wrap items-center justify-between gap-6 lg:gap-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <DefaultAvatar className="h-8 w-8" />
              </div>

              <div>
                <Typography color="blue-gray" variant="h6">
                  {user.username}
                </Typography>

                <Typography
                  variant="small"
                  className="font-normal text-gray-600"
                >
                  {user.email}
                </Typography>
              </div>
              <button className="ml-4 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 justify-self-right">
                View Library
              </button>
              <button className="ml-4 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 justify-self-right">
                Edit Story
              </button>
              <button className="ml-4 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 justify-self-right">
                View Recommendations
              </button>
            </div>
          </div>
          <div className="mt-8">
            <Typography variant="h5" className="mb-4 text-left">
              Gamer Story:
            </Typography>
            <Typography variant="body1" className="text-gray-700 text-left">
              This is a placeholder for the user's bio or additional information.
              You can customize this section to include more details about the user.
            </Typography>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Your Vibes:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder for the user's quiz answers. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Your Style:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder for the user's style preferences. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className="mb-4 text-left">
            Recent Games:
          </Typography>
          <Typography variant="body1" className="text-gray-700 text-left">
            This is a placeholder for the user's recent games. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
    </section>
  );
}

