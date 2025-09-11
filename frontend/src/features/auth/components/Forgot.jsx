import useField from '../../../shared/useField'

const Forgot = () => {
  const username = useField('text')

  const padding = {
    margin: 5
  }

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  return (
    <div style={{ all: 'unset' }}>
      <b>Reset your password</b>
      <form onSubmit={handleSubmit}>
        <label htmlFor='username-input'>username: </label>
        <input
          id='username-input'
          type={username.type}
          value={username.value}
          name='username'
          onChange={username.onChange}
        />
        <div>
          <button style={padding} type="submit">Send reset email</button>
        </div>
      </form>
    </div>
  )
}

export default Forgot;