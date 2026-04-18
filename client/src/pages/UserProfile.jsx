import React, { useState, useEffect } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import {
  Card, CardBody, CardHeader,
  Typography,
} from "@material-tailwind/react";
import { UserCircleIcon as DefaultAvatar } from "@heroicons/react/24/outline";
import logoImage from "../assets/logo.jpg";
import { updateProfile, api } from "../utilities";

export default function UserProfile() {
  const { user } = useOutletContext();


  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  
  // Profile data from API
  const [profile, setProfile] = useState({
    personality: null,
    play_time_preference: null,
    personality_tags: [],
    quiz_results: null,
  });
  
  // Profile data: temporary edits (only exists in edit mode)
  const [draftProfile, setDraftProfile] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setState("loading");
      setError(null);
      try {
        const response = await api.get("profile/");
        const profileData = {
          personality: response.data.personality || null,
          play_time_preference: response.data.play_time_preference || null,
          personality_tags: response.data.personality_tags || [],
          quiz_results: response.data.quiz_results || null,
        };
        setProfile(profileData);
        setState("viewing");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
        setState("error");
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleEditProfile = () => {
    setDraftProfile(profile); // Start editing with current profile data
    setState("editing");
  };

  const handleCancelEdit = () => {
    setDraftProfile(null);
    setState("viewing");
  };

  const handleSaveProfile = async () => {
    setState("loading");
    setError(null);
    try {
      const updatedData = await updateProfile(draftProfile);
      setProfile({
        personality: updatedData.personality || null,
        play_time_preference: updatedData.play_time_preference || null,
        personality_tags: updatedData.personality_tags || [],
        quiz_results: updatedData.quiz_results || null,
      });
      setDraftProfile(null);
      setState("viewing");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save profile");
      setState("error");
    }
  };
  
  
  // Show editing state
  if (state === "editing") {
    return (
      <section className="container mx-auto px-8 py-10">
        <Typography variant="h5">Editing profile...</Typography>
        {/* Placeholder for edit form - you can implement this with inputs bound to draftProfile */}
        <button className={styles.btn} onClick={handleSaveProfile}>Save</button>
        <button className={styles.btn} onClick={handleCancelEdit}>Cancel</button>
      </section>
    );
  }
  
  // Show loading state
  if (state === "loading") {
    return (
      <section className="container mx-auto px-8 py-10">
        <Typography variant="h5">Loading profile...</Typography>
      </section>
    );
  }

  // Show error state
  if (state === "error") {
    return (
      <section className="container mx-auto px-8 py-10">
        <Card className="bg-red-50 border border-red-300">
          <CardBody>
            <Typography color="red" variant="h5">
              Error
            </Typography>
            <Typography color="red" variant="body1">
              {error}
            </Typography>
          </CardBody>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-8 py-10">
      <Card
        shadow={false}
        className={styles.card}
      >
        <h1 className="flex items-center justify-center text-4xl font-bold text-yellow-300 text-shadow-lg">
          {user.username}'s Profile
        </h1>
        <CardHeader shadow={false} className={styles.header}>
          <img
            src={logoImage}
            alt="dark"
            className="h-full w-full object-cover object-center"
          />
        </CardHeader>
        <CardBody className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-6 lg:gap-0">
            <div className="flex items-center gap-3">
              <div className={styles.avatarContainer}>
                <DefaultAvatar className={styles.avatarIcon} />
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
              <button className={styles.btn}>
                View Library
              </button>
              <button className={styles.btn} onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button className={styles.btn}>
                View Recommendations
              </button>
            </div>
          </div>
          <div className="mt-8">
            <Typography variant="h5" className={styles.sectionTitle}>
              Gamer Story:
            </Typography>
              <Typography variant="body1" className={styles.sectionContent}>
              This is a placeholder for the user's bio or additional information.
              You can customize this section to include more details about the user.
            </Typography>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className={styles.sectionTitle}>
            Your Vibes:
          </Typography>
          <Typography variant="body1" className={styles.sectionContent}>
            Personality: {profile.personality || "Not set"}
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className={styles.sectionTitle}>
            Your Style:
          </Typography>
          <Typography variant="body1" className={styles.sectionContent}>
            Play Time: {profile.play_time_preference || "Not set"}
          </Typography>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Typography variant="h5" className={styles.sectionTitle}>
            Recent Games:
          </Typography>
          <Typography variant="body1" className={styles.sectionContent}>
            This is a placeholder for the user's recent games. You can customize
            this section to display relevant information.
          </Typography>
        </CardBody>
      </Card>
    </section>
  );
}

const styles = {
  card: "border border-gray-300 rounded-2xl bg-violet-500",

  header: "mt-5 h-70 rounded-lg",

  avatarContainer: "flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600",

  avatarIcon: "h-8 w-8",

  username: "text-blue-gray",

  email: "font-normal text-gray-600",

  btn: "ml-4 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 justify-self-right",

  sectionTitle: "mb-4 text-left",

  sectionContent: "text-gray-700 text-left",
};