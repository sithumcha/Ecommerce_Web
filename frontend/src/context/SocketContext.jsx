import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && userInfo) {
      socket.emit('join_user_room', userInfo._id);

      socket.on('order_status_update', (data) => {
        addToast(data.message, 'success');
      });

      // We can also listen for new messages here later
      socket.on('new_message_notification', (data) => {
        addToast(`New message from ${data.senderName}`, 'info');
      });

      return () => {
        socket.off('order_status_update');
        socket.off('new_message_notification');
      };
    }
  }, [socket, userInfo, addToast]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
