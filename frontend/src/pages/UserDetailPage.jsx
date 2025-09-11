import { useParams } from 'react-router-dom'
import { useUsers } from '../features/users/hooks/useUsers'

const User = () => {
  const id = useParams().id
  const { data: users } = useUsers()

  if (!users) return null

  const user = users.find((user) => user.id === id)

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map((blog) => <li key={blog.id}>{blog.title}</li>)}
      </ul>
    </div>
  )
}

export default User