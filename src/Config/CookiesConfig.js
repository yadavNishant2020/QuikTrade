

export const CookiesConfig = {
  removeCookie: (name) => {
    // Set the expiration date to a time in the past
    const pastDate = new Date(0);
    // Remove the cookie by setting its expiration time to the past
    document.cookie = `${name}=;expires=${pastDate.toUTCString()};path=/`;
  },
  setCookie: (name, value) => {

    // Calculate the expiration time for 9 AM today
    const today = new Date();
    const expires = new Date(today);
    expires.setHours(9, 0, 0, 0);
    // If it's already past 9 AM today, set expiration for 9 AM tomorrow
    if (today >= expires) {
      expires.setDate(today.getDate() + 1);
    }
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  getCookie: (name) => {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return '';
  }, setItemWithExpiry(key, value) {

    const midnight = new Date();
    midnight.setHours(23, 55, 0, 0); // Set the time to 11:00:00 PM
    const elevenPM = midnight.getTime();
    const item = { value: value, expires: elevenPM };
    localStorage.setItem(key, JSON.stringify(item));
  }, getItemWithExpiry(key) {

    const itemString = localStorage.getItem(key);
    if (!itemString) {
      return "";
    }
    const item = JSON.parse(itemString);
    const now = new Date().getTime();
    if (now > item.expires) {
      // Item has expired, remove it from localStorage
      localStorage.removeItem(key);
      return "";
    }
    return item.value;
  }, removeLocalStorageItem(key) {
    localStorage.removeItem(key);
    return null;
  }


}