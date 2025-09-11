import ReactDOM from 'react-dom/client';
import { NotificationContextProvider } from './NotificationContext';
import { UserContextProvider } from './UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
} from 'react-router-dom'

import App from './App';
import './styles/globals.css'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <UserContextProvider>
        <NotificationContextProvider>
          <App />
        </NotificationContextProvider>
      </UserContextProvider>
    </Router>
  </QueryClientProvider>
);
