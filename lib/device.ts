// Anonymous per-browser id so "My reports" works without a login.
export function deviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("rahi_device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("rahi_device", id);
  }
  return id;
}
