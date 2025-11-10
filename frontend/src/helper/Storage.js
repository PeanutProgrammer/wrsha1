// Set the user in localStorage with a unique session key for each tab
export const setAuthUser = (data) => {
  const sessionKey = `user_${Math.random().toString(36).substr(2, 9)}`; // Generate unique session key
  localStorage.setItem(sessionKey, JSON.stringify(data));
  // Optionally store the key in sessionStorage for retrieval across tabs within the same session
  sessionStorage.setItem('currentSessionKey', sessionKey); 
};

// Get the user from the current session's localStorage
export const getAuthUser = () => {
  const sessionKey = sessionStorage.getItem('currentSessionKey');
  if (sessionKey && localStorage.getItem(sessionKey)) {
    return JSON.parse(localStorage.getItem(sessionKey));
  }
  return null; // or handle undefined session case
};

// Remove the user data from localStorage for the current session
export const removeAuthUser = () => {
  const sessionKey = sessionStorage.getItem('currentSessionKey');
  if (sessionKey) {
    localStorage.removeItem(sessionKey);
    sessionStorage.removeItem('currentSessionKey');
  }
};
