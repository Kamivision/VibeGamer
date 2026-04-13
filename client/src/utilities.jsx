import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1/",
});

function setAuthHeader(token) {
  api.defaults.headers.common.Authorization = `Token ${token}`;
}

function clearAuthHeader() {
  delete api.defaults.headers.common.Authorization;
}

function normalizeUser(data) {
  return {
    email: data.email,
    username: data.username,
  };
}

export async function userVerify() {
  const token = localStorage.getItem("token");

  if (!token) {
    clearAuthHeader();
    return null;
  }

  setAuthHeader(token);

  try {
    const response = await api.get("users/");

    if (response.status === 200) {
      return normalizeUser(response.data);
    }

    return null;
  } catch (error) {
    localStorage.removeItem("token");
    clearAuthHeader();
    return null;
  }
}

export async function handleSignIn(formData) {
  const response = await api.post("users/login/", formData);

  if (response.status === 200) {
    const token = response.data.token;
    localStorage.setItem("token", token);
    setAuthHeader(token);
    return normalizeUser(response.data);
  }

  return null;
}

export async function handleSignUp(formData) {
  const response = await api.post("users/create/", formData);

  if (response.status === 201) {
    const token = response.data.token;
    localStorage.setItem("token", token);
    setAuthHeader(token);
    return normalizeUser(response.data);
  }

  return null;
}

export async function handleSignOut() {
  try {
    await api.post("users/logout/");
  } catch (error) {
    // Ignore logout request failures and still clear local session.
  } finally {
    localStorage.removeItem("token");
    clearAuthHeader();
  }
}
