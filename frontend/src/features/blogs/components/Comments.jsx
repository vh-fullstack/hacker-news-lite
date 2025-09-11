import { useState } from 'react'
import TimeAgo from '../../../shared/TimeAgo'
import { useComments } from '../hooks/useComments'

const Comments = ({ id }) => {
  const [input, setInput] = useState(null)
  const { comments, isLoading, error, addComment } = useComments(id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input) return;

    await addComment(input)

    setInput('')
  }

  if (isLoading) {
    return <div>loading comments...</div>;
  }

  if (error) {
    return <div>error loading comments</div>
  }

  return (
    <div>
      <h2>comments</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(event) => setInput(event.target.value)}>
        </input>
        <button type="submit">add comment</button>
      </form>
      <ul>
        {comments?.map((comment) => (
          <li key={comment._id}>
            {comment.text}
            <TimeAgo timestamp={comment.date} />
          </li>
        ))}
      </ul>
    </div >
  )
}

export default Comments