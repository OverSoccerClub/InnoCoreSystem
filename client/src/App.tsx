
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { DialogProvider } from './contexts/DialogContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <AppRouter />
        <Toaster position="top-right" richColors closeButton />
      </DialogProvider>
    </AuthProvider>
  );
}

export default App;
