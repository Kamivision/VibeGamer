import axios from "axios";

const tokenKey = "token";

export const api = axios.create({
  baseURL: "/api/v1/",
});

function getStoredToken() {
  return localStorage.getItem(tokenKey);
}

function setAuthHeader(token) {
  api.defaults.headers.common.Authorization = `Token ${token}`;
}

function clearAuthHeader() {
  delete api.defaults.headers.common.Authorization;
}

function keepSession(token) {
  localStorage.setItem(tokenKey, token);
  setAuthHeader(token);
}

function clearSession() {
  localStorage.removeItem(tokenKey);
  clearAuthHeader();
}

function createAuthenticatedUser(data) {
  keepSession(data.token);
  return normalizeUser(data);
}

function normalizeUser(data) {
  return {
    email: data.email,
    username: data.username,
  };
}

async function authenticateUser(path, formData, successStatus) {
  const response = await api.post(path, formData);

  if (response.status === successStatus) {
    return createAuthenticatedUser(response.data);
  }

  return null;
}

export async function userVerify() {
  const token = getStoredToken();

  if (!token) {
    clearAuthHeader();
    return null;
  }

  setAuthHeader(token);

  try {
    const response = await api.get("users/");

    return response.status === 200 ? normalizeUser(response.data) : null;
  } catch (error) {
    clearSession();
    return null;
  }
}

export async function handleSignIn(formData) {
  return authenticateUser("users/login/", formData, 200);
}

export async function handleSignUp(formData) {
  return authenticateUser("users/register/", formData, 201);
}

export async function handleSignOut() {
  try {
    await api.post("users/logout/");
  } catch (error) {
    // Ignore logout request failures and still clear local session.
  } finally {
    clearSession();
  }
}

export async function saveQuizResult({ personality, quizResults}) {
  const response = await api.put("profile/", { 
    personality, quiz_results: quizResults, 
  });
  return response.data;
}

export async function updateProfile({ personality, personalityTags, quizResults, playTimePreference }) {
  const response = await api.put("profile/", { 
    personality, 
    personality_tags: personalityTags, 
    quiz_results: quizResults, 
    play_time_preference: playTimePreference,
  });
  return response.data;
}
// Utility function to build query parameters for recommendations based on profile data that will work with RAWG and my backend.
export function recommendedParams(personalityTags = [], playTimePreference = "") {
  const params = {};

  const normalizedTags = Array.isArray(personalityTags)
  // Filter out non-string, empty, or whitespace-only tags, then normalize and deduplicate.
    ? [...new Set(
        personalityTags
          .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
      )]
    : [];

  if (normalizedTags.length > 0) {
    params.personality_tags = normalizedTags.join(",");
  }

  const normalizedPlayTime =
    typeof playTimePreference === "string" ? playTimePreference.trim() : "";

  if (normalizedPlayTime) {
    params.play_time_preference = normalizedPlayTime;
  }

  return params;
}

export async function fetchRecommendedGames(personalityTags = [], playTimePreference = "") {
  const params = recommendedParams(personalityTags, playTimePreference);
  const response = await api.get("games/recommendations/", { params });
  return response.data;
}

export async function fetchNewReleases(page = 1) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const toDate = today.toISOString().split("T")[0];
  const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

  const response = await api.get("games/rawg/", {
    params: {
      ordering: "-released",
      dates: `${fromDate},${toDate}`,
      page,
      page_size: 12,
    },
  });
  return response.data;
}

export async function fetchGames(searchTerm, page = 1) {
  const response = await api.get("games/rawg/", {
    params: { 
      search: searchTerm, 
      page, 
      page_size: 12 
    },
  });
  return response.data;
}

export async function fetchGameByGenre(genre, page = 1) {
  const response = await api.get("games/rawg/", {
    params: { 
      genres: genre, 
      page, 
      page_size: 12 
    },
  });
  return response.data;
}




