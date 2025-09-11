import Logout from './Logout'
import { useAuth } from '../hooks/useAuth'

const UserStatus = () => {
  const { user } = useAuth()

  return <span>{user.name} logged in <Logout /></span>
}

export default UserStatus