import { io, type Socket } from 'socket.io-client';

// Same server as the API, without the "/api" part
const SOCKET_URL = 'https://nutrifit-backend-api-t21p.onrender.com';

// Events the server sends to admins. Both are only a "something changed, reload" signal.
//  - tickets:changed : a support ticket was created, answered or updated
//  - data:changed    : users, meals, workouts or plans changed
export type AdminEvent = 'tickets:changed' | 'data:changed';

// ONE shared connection for the whole admin site. Every page / the sidebar
// subscribes to it, and it closes when nobody is listening anymore.
let socket: Socket | null = null;
let subscribers = 0;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Called on every (re)connect, so the latest admin token is always used
      auth: (cb) => cb({ token: localStorage.getItem('adminToken') }),
    });
  }
  return socket;
};

// Live updates for the admin site. `onChange` runs when the server sends one of
// the `events`, after every (re)connect, and when the tab becomes visible.
// Returns a function that stops listening.
export function connectAdminSocket(
  onChange: () => void,
  events: AdminEvent[] = ['tickets:changed']
): () => void {
  const s = getSocket();
  subscribers += 1;

  events.forEach((e) => s.on(e, onChange));
  s.on('connect', onChange);

  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  document.addEventListener('visibilitychange', onVisible);

  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    events.forEach((e) => s.off(e, onChange));
    s.off('connect', onChange);
    subscribers -= 1;
    if (subscribers <= 0) {
      s.disconnect();
      socket = null;
      subscribers = 0;
    }
  };
}