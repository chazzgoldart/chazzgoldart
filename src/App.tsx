import { AuthProvider } from './contexts/AuthContext';
import SubdomainRouter from './components/SubdomainRouter';

function App() {
  return (
    <AuthProvider>
      <SubdomainRouter />
    </AuthProvider>
  );
}

export default App;
