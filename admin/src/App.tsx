import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/core/auth/AuthContext';
import { AppRouter } from '@/core/router';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
