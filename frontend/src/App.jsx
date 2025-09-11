import { useEffect, Suspense } from 'react';
import Outlet from './shared/Outlet.jsx';
import { useAuth } from './features/auth/hooks/useAuth';
import { useBlogs } from './features/blogs/hooks/useBlogs'

import Notification from './shared/Notification';
import Navigation from './shared/Navigation';

const App = () => {
  const { initializeAuth } = useAuth()
  const { isLoading } = useBlogs()

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) return <div>loading data...</div>

  return (
    <div>
      <center>
        <Navigation />
        <Notification />
        <main>
          <Suspense fallback={<div>Loading page...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </center>
    </div >
  );
};

export default App;