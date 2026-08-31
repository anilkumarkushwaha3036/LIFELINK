import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Automatically use the configured URL or fall back to environment defaults
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:5000');
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      if (user.role === 'donor') {
        socket.emit('join_grid', user._id);
      } else if (user.role === 'hospital') {
        socket.emit('hospital_join', user._id);
      } else if (user.role === 'admin') {
        socket.emit('admin_join');
      }
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
