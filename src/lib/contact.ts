export const CONTACT_EMAIL = "theroomcommunityofficial@gmail.com";

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1";

export const CONTACT_GMAIL_URL = `${GMAIL_COMPOSE_URL}&to=${encodeURIComponent(CONTACT_EMAIL)}`;

export const SPONSOR_GMAIL_URL = `${CONTACT_GMAIL_URL}&su=${encodeURIComponent(
  "The Room — Sponsorship inquiry",
)}`;
