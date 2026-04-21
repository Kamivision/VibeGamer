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

export function keepSession(token) {
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
  return authenticateUser("users/create/", formData, 201);
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

export async function saveQuizResult({ personality, quizResult}) {
  const response = await api.put("profile/", { 
    personality, quiz_results: quizResult, 
  });
  return response.data;
}

export async function updateProfile({ personality, personalityTags, quizResults, playTimePreference, genreTags, platformTags, excludedTags }) {
  const response = await api.put("profile/", { 
    personality, 
    personality_tags: personalityTags, 
    quiz_results: quizResults, 
    play_time_preference: playTimePreference,
    genre_tags: genreTags,
    platform_tags: platformTags,
    excluded_tags: excludedTags,
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
  const response = await api.get("games/recommended/", { params });
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

export async function fetchRAWGGames(searchTerm = "", genre = "", platform = "", page = 1, pageSize = 12) {
  const params = {
    page,
    page_size: pageSize,
  };
  
  searchTerm = searchTerm.trim();
  genre = genre.trim();
  platform = platform.trim();

  if (searchTerm !== "") {
    params.search = searchTerm;
  }
  if (genre !== "") {
      params.genres = genre;
  }
  if (platform !== "") {
      params.platforms = platform;
    }
  
  const response = await api.get("games/rawg/", {
    params,
  });
  return response.data;
}


export async function fetchGameDetails(gameId) {
  const response = await api.get(`games/rawg/${gameId}/`);
  return response.data;
}

export async function fetchVibeExplanation({ gameName, genres = [], personality = "", personalityTags = [] }) {
  const response = await api.post("vibes/explain/", {
    game_name: gameName,
    genres,
    personality,
    personality_tags: personalityTags,
  });
  return response.data.explanation;
}

async function ensureGameRecord(rawgGame) {
  const externalId = rawgGame?.id;
  if (externalId === undefined || externalId === null) {
    throw new Error("Game is missing an id and cannot be saved.");
  }

  const normalizedGenres = Array.isArray(rawgGame?.genres)
    ? rawgGame.genres
        .map((genre) => {
          if (typeof genre === "string") return genre;
          if (genre && typeof genre === "object") return genre.name || "";
          return "";
        })
        .filter((genre) => typeof genre === "string" && genre.trim().length > 0)
    : [];

  const primaryGenre = normalizedGenres.length > 0 ? normalizedGenres[0] : "";

  const normalizedPlatforms = Array.isArray(rawgGame?.platforms)
    ? rawgGame.platforms
        .map((platform) => {
          if (typeof platform === "string") return platform;
          if (platform && typeof platform === "object") {
            if (typeof platform.name === "string") return platform.name;
            if (platform.platform && typeof platform.platform === "object") {
              return platform.platform.name || "";
            }
          }
          return "";
        })
        .filter((platform) => typeof platform === "string" && platform.trim().length > 0)
    : [];

  const response = await api.post("games/", {
    source: "rawg",
    external_id: String(externalId),
    slug: rawgGame.slug || "",
    title: rawgGame.name || "",
    description: rawgGame.description_raw || "",
    genre: primaryGenre,
    tags: normalizedGenres,
    playtime: rawgGame.playtime || null,
    image_url: rawgGame.background_image || "",
    released_at: rawgGame.released || null,
    metadata: {
      rawg_rating: rawgGame.rating || null,
      platforms: normalizedPlatforms,
    },
  });

  return response.data;
}

export async function addToLibrary(rawgGame) {
  const game = await ensureGameRecord(rawgGame);

  const saveCheckResponse = await api.get(`games/save/${game.id}/`);
  if (saveCheckResponse.data.saved) {
    return { alreadySaved: true, game };
  }

  const saveResponse = await api.post(`games/save/${game.id}/`);
  return { alreadySaved: false, game, result: saveResponse.data };
}

export async function fetchLibrary() {
  const response = await api.get("games/saved/");
  return response.data;
}

export async function removeFromLibrary(gameId) {
  const response = await api.delete(`games/save/${gameId}/`);
  return response.data;
}