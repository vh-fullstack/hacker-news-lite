import { useAuth } from '../../auth/hooks/useAuth';

const Logout = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <span style={{ padding: 5 }}>
      <button style={{ margin: '10px 0' }} type="submit" onClick={logout}>
        Logout
      </button>
    </span>
  );
};

export default Logout;
