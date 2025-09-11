import {
  Link
} from 'react-router-dom'

import { useAuth } from '../features/auth/hooks/useAuth'
import Logout from '../features/auth/components/Logout'

const Navigation = () => {
  const { user } = useAuth()

  const padding = {
    padding: 5
  }

  return (
    <div style={{ textAlign: 'left' }}className="nav">
      <Link style={padding} to="/">blogs</Link>
      <Link style={padding} to="/users">users</Link>
      {user ? <em>{user.name ?? user.username} logged in</em> : <Link style={padding} to="/login">login</Link>}
      <Logout />
    </div>
  )
}

export default Navigation