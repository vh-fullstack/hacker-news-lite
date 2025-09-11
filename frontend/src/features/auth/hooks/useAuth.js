import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import blogService from '../../../services/blogs';
import loginService from '../../../services/login';

import UserContext from '../../../UserContext';
import { useNotificationDispatch } from '../../../NotificationContext';

export const useAuth = () => {
  const [user, userDispatch] = useContext(UserContext);
  const notificationDispatch = useNotificationDispatch();
  const navigate = useNavigate()

  const login = async (credentials) => {
    try {
      const user = await loginService.login(credentials);
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      userDispatch({ type: 'ADD_USER', payload: user })
      notificationDispatch({
        type: 'addNotification',
        payload: { message: `Welcome, ${user.name || user.username}!`, type: 'success' }
      });
      setTimeout(() => {
        notificationDispatch({ type: 'clear' })
      }, 5000);
    } catch (exception) {
      notificationDispatch({
        type: 'addNotification',
        payload: { message: 'wrong username or password', type: 'success' }
      })
      setTimeout(() => {
        notificationDispatch({ type: 'clear' })
      }, 5000);
    }
  };

  const logout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    userDispatch({ type: 'CLEAR_USER' })
    navigate('/login')
    blogService.setToken(null)
  }

  const initializeAuth = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      userDispatch({ type: 'ADD_USER', payload: user })
      blogService.setToken(user.token);
    }
  }
  // The hook returns the state and the functions to manipulate it
  return {
    user,
    login,
    logout,
    initializeAuth,
  };
};
