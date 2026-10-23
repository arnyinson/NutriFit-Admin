import { io } from 'socket.io-client';

// Same server as the API, without the "/api" part
const SOCKET_URL = 'https://nutrifit-backend-api-t21p.onrender.com';

// Live updates for the admin site. `onChange` runs when the server says a
// ticket changed, after every (re)connect, and when the tab becomes visible.
// Returns a function that stops everything.
export function connectAdminSocket(onChange: () => void): () => void {
  const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    // Called on every (re)connect, so the latest admin token is always used
    auth: (cb) => cb({ token: localStorage.getItem('adminToken') }),
  });

  socket.on('tickets:changed', onChange);
  socket.on('connect', onChange);

  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  document.addEventListener('visibilitychange', onVisible);

  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    socket.off('tickets:changed', onChange);
    socket.off('connect', onChange);
    socket.disconnect();
  };
}