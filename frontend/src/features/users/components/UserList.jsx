import { useUsers } from '../hooks/useUsers';
import {
  Link
} from 'react-router-dom'

const User = () => {
  const { data: users } = useUsers()

  if (!users) {
    return <div>no users found</div>
  }

  return (
    <div>
      <h2>Users</h2>
      <table >
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>

              <td>
                <Link to={`/users/${user.id}`}>{user.name || user.username } </Link>
              </td>

              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default User;