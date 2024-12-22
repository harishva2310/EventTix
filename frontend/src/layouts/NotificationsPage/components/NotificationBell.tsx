import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/user-notifications" className="relative inline-flex items-center">
      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}