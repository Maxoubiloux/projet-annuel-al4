import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/core/auth/AuthContext';
import { AppRouter } from '@/core/router';
import { ToastProvider } from '@/core/components/ToastProvider';
import { ErrorBoundary } from '@/core/components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
