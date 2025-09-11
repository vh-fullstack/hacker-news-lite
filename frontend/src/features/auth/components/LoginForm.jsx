import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  Link
} from 'react-router-dom'

import useField from '../../../shared/useField';

const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const username = useField('text')
  const password = useField('password')

  const handleSubmit = (event) => {
    event.preventDefault();

    login({
      username: username.value,
      password: password.value,
    });

    username.reset();
    password.reset();
    navigate('/')
  }

  const margin = {
    margin: 20,
  }

  return (
    <div>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-username-input">username: </label>
          <input
            id="login-username-input"
            type={username.type}
            value={username.value}
            name="username"
            onChange={username.onChange}
          />
        </div>
        <div>
          <label htmlFor="login-password-input">password: </label>
          <input
            id="login-password-input"
            type={password.type}
            value={password.value}
            name="password"
            onChange={password.onChange}
          />
        </div>
        <button type="submit">login</button>
      </form>
      <Link style={margin} to="/forgot">Forgot your password?</Link>
    </div>
  );
};

export default LoginForm;
