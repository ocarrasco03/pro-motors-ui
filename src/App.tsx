import { useAppSelector } from '@/app/hooks';
import { AppRouter } from '@/routes/AppRouter';
import { useAuthBootstrap } from '@/features/auth/useAuthBootstrap';

function App() {
  useAuthBootstrap();

  const isBootstrapping = useAppSelector((state) => state.auth.isBootstrapping);
  
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-stone-600"></div>
        Cargando sesión...
      </div>
    )
  }

  return <AppRouter />;
}

export default App
