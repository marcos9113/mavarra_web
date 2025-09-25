// In-memory store for demo. Replace with DB later.
// WARNING: This does not persist across server restarts or instances.

export const users = new Map(); // username -> { secret, created_at }

