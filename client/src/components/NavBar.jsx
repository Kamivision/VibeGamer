import React from "react";
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {Link, useNavigate} from "react-router-dom";
import { handleSignOut } from "../utilities";



function NavItem({ label }) {
  return (
    <a href="#">
      <Typography as="li" color="blue-gray" className="p-1 font-medium">
        {label}
      </Typography>
    </a>
  );
}

function NavList() {
  return (
    <ul className="mb-4 mt-2 flex flex-col gap-3 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-8">
      <NavItem label="Genres" />
      <NavItem label="New Releases" />
      <Link to="/library">
        <NavItem label="Your Library" />
      </Link>
      <NavItem label="Vibe Quiz" />
    </ul>
  );
}

export default function NavBar({ user, setUser }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  function handleOpen() {
    setOpen((current) => !current);
  }

  async function onSignOutClick() {
    await handleSignOut();
    setUser(null);
    navigate("/");
  }

  React.useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 960) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Navbar className="bg-cyan-400" fullWidth>
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <Link to="/">
          <Typography
            as="span"
            color="blue-gray"
            className="mr-4 cursor-pointer text-lg font-bold"
          >
            Vibe Gamer
          </Typography>
        </Link>

        <div className="hidden lg:block">
          <NavList />
        </div>

        {user ? (
          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-sm">{user.username}</span>
            <Button color="gray" onClick={onSignOutClick}>
              Sign out
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button color="gray" className="hidden lg:inline-block">
              Sign in
            </Button>
          </Link>
        )}

        <IconButton
          size="sm"
          variant="text"
          color="blue-gray"
          onClick={handleOpen}
          className="ml-auto inline-block text-blue-gray-900 lg:hidden"
        >
          {open ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>

      <Collapse open={open}>
        <div className="mt-2 rounded-xl bg-white py-2">
          <NavList />

          {user ? (
            <Button className="mb-2" fullWidth onClick={onSignOutClick}>
              Sign out
            </Button>
          ) : (
            <Link to="/auth">
              <Button className="mb-2" fullWidth>
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </Collapse>
    </Navbar>
  );
}


