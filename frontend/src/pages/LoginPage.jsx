import CreateAccount from '../features/auth/components/CreateAccount';
import LoginForm from '../features/auth/components/LoginForm';


const LoginPage = () => {
  return (
    <div>
      <b>Log in to your account</b>
      <LoginForm />
      <CreateAccount />

    </div>
  )
}

export default LoginPage;