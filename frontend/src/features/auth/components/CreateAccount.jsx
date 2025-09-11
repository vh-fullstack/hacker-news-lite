import useField from '../../../shared/useField'
import userService from '../../../services/users'

const CreateAccount = () => {
  const username = useField('text')
  const password = useField('password')

  const handleSubmit = (event) => {
    event.preventDefault();

    userService.createUser({ username: username.value, password: password.value })

    username.reset()
    password.reset()
  }

  return (
    <div>
      <b>Create account</b>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="create-username-input">username: </label>
          <input
            id="create-username-input"
            type={username.type}
            value={username.value}
            name="username"
            onChange={username.onChange}
          />
        </div>
        <div>
          <label htmlFor="create-password-input">password: </label>
          <input
            id="create-password-input"
            type={password.type}
            value={password.value}
            name="password"
            onChange={password.onChange}
          />
        </div>
        <button type="submit">create account</button>
      </form >
    </div >
  )
}

export default CreateAccount