import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationsPage() {
  const { notifications, markAllAsRead } = useNotifications();

  useEffect(() => {
    markAllAsRead();
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <ScrollArea className="h-[600px] rounded-md border">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification, index) => (
            <Card key={index} className="p-4 mb-2 mx-2">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-muted-foreground">{notification.message}</p>
              <time className="text-sm text-muted-foreground">
                {new Date(notification.timestamp || Date.now()).toLocaleString()}
              </time>
            </Card>
          ))
        )}
      </ScrollArea>
    </div>
  );
}