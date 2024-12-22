import React, { createContext, useContext, useState, useEffect } from 'react';
import '@/utils/polyfills';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { UserResponse } from '@/models/UserModel';

interface NotificationMessage {
  title: string;
  message: string;
  userId: string;
  timestamp?: Date;
}

interface NotificationContextType {
  notifications: NotificationMessage[];
  unreadCount: number;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState<UserResponse | undefined>();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await getAccessTokenSilently();
        console.log('Token:', token)
        const response = await axios.get(`/api/user/email?email=${user?.email}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log('User details:', response.data)
        setUserData(response.data);
      } catch (error) {
        console.log('User details not found')
      }
    }

    if (user?.email) {
      fetchUserDetails()
    }
  }, [user?.email, getAccessTokenSilently])

  useEffect(() => {
    if (!isAuthenticated || !user || !userData?.user_id) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/api/ws-notifications', null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 30000,
      }),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
          console.log('Connected to WebSocket');
          console.log('Subscribing for user:', userData.user_id);
          stompClient.subscribe(`/topic/notifications/${userData.user_id}`, (message) => {
              console.log('Received message:', message.body);
              const newNotification = JSON.parse(message.body);
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
          });
      },
      onDisconnect: () => {
          console.log('Disconnected from WebSocket');
      }
    });

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [isAuthenticated, user, userData])

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};