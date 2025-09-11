import { useNotificationValue } from '../NotificationContext';

const Notification = () => {
  const notification = useNotificationValue()

  if (notification === null) return null;

  const { message, type } = notification;

  return <div className={`notification ${type}`}>{message}</div>;
};

export default Notification;
