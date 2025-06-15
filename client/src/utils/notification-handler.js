import { toast } from 'react-toastify';

const renderNotification = (type, title, message) => {
  // 'type' của react-toastify: success, error, warn, info, default
  // 'type' của react-notifications-component: success, danger, info, default, warning

  let toastType = type;
  if (type === 'danger') {
    toastType = 'error'; // Chuyển 'danger' thành 'error' cho toastify
  } else if (type === 'warning') {
    toastType = 'warn'; // Chuyển 'warning' thành 'warn'
  }

  // toastify không có title riêng biệt như react-notifications-component,
  // bạn có thể gộp title và message hoặc chỉ dùng message.
  const displayMessage = title ? `${title}! ${message}` : message;

  switch (toastType) {
    case 'success':
      toast.success(displayMessage);
      break;
    case 'error':
      toast.error(displayMessage);
      break;
    case 'info':
      toast.info(displayMessage);
      break;
    case 'warn':
      toast.warn(displayMessage);
      break;
    default:
      toast(displayMessage); // Toast mặc định
      break;
  }
};

export default renderNotification;