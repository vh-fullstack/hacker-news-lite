import {
  Routes, Route, Navigate
} from 'react-router-dom'

import {
  HomePage,
  UsersPage,
  UserDetailPage,
  BlogDetailPage
} from '../pages';

import { useAuth } from '../features/auth/hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import Forgot from '../features/auth/components/Forgot';

const Outlet = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
      <Route path="/blogs/:id" element={<BlogDetailPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route path="/forgot" element={<Forgot />} />
    </Routes>
  )
}

export default Outlet