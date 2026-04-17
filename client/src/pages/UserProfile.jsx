import React from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import {
  Button,
  Card, CardBody, CardHeader,
  Tabs, TabsHeader, TabsBody, Tab, TabPanel,
  Typography,
} from "@material-tailwind/react";
import { UserCircleIcon as DefaultAvatar } from "@heroicons/react/24/outline";
import {
  Square3Stack3DIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export default function UserProfile() {
  const data = [
      {
        label: "Dashboard",
        value: "dashboard",
        icon: Square3Stack3DIcon,
        desc: `It really matters and then like it really doesn't matter.
        What matters is the people who are sparked by it. And the people
        who are like offended by it, it doesn't matter.`,
      },
      {
        label: "Profile",
        value: "profile",
        icon: UserCircleIcon,
        desc: `Because it's about motivating the doers. Because I'm here
        to follow my dreams and inspire other people to follow their dreams, too.`,
      },
      {
        label: "Settings",
        value: "settings",
        icon: Cog6ToothIcon,
        desc: 
          <div className="flex flex-col gap-4 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700">Time Preference</label>
            <select className="block w-full p-2 border border-gray-300 rounded-md">
              <option value="short"> Short and Sweet - 1 hour or less</option>
              <option value="medium"> I've got some time - up to 2 hours</option>
              <option value="long"> True gamer session - up to 4</option>
              <option value="xlong"> All the time in the world - 4 hours or more</option>
            </select>
          </div>,
      },
    ];

  const { user } = useOutletContext();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="container mx-auto px-8 py-10">
      <Card
        shadow={false}
        className="border border-gray-300 rounded-2xl"
      >
        <CardHeader shadow={false} className="h-60 !rounded-lg">
          {/* <Image
            src="/image/dark-image.png"
            alt="dark"
            height={1024}
            width={1024}
            className="w-full h-full object-center"
          /> */}
        </CardHeader>
        <CardBody>
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
            </div>
          <Tabs value="dashboard">
                <TabsHeader>
                  {data.map(({ label, value, icon }) => (
                    <Tab key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(icon, { className: "w-5 h-5" })}
                        {label}
                      </div>
                    </Tab>
                  ))}
                </TabsHeader>
                <TabsBody>
                  {data.map(({ value, desc }) => (
                    <TabPanel key={value} value={value}>
                      {desc}
                    </TabPanel>
                  ))}
                </TabsBody>
          </Tabs>
            </div>
        </CardBody>
      </Card>
    </section>
  );
}

