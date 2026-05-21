import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppHomePage from "./pages/AppHomePage";
import AuthPage from "./pages/AuthPage";
import { getToken } from "./utils/authStorage";

function AuthRoute() {
  const token = getToken();

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage />;
}

function ProtectedRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <AppHomePage />;
}

function RootRoute() {
  const token = getToken();

  return <Navigate to={token ? "/app" : "/auth"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/app" element={<ProtectedRoute />} />

        <Route path="/" element={<RootRoute />} />
        <Route path="*" element={<RootRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
