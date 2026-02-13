import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard"; // Si está en /pages
import Grupo from "./Grupo"; // Si está en /src/
import CarreraCaballos from "./CarreraCaballos"; // Si está en /src/
import PreguntasAdmin from "./pages/PreguntasAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/grupo1" element={<ProtectedRoute><Grupo grupo="grupo1" /></ProtectedRoute>} />
      <Route path="/grupo2" element={<ProtectedRoute><Grupo grupo="grupo2" /></ProtectedRoute>} />
      <Route path="/grupo3" element={<ProtectedRoute><Grupo grupo="grupo3" /></ProtectedRoute>} />
      <Route path="/carrera" element={<ProtectedRoute><CarreraCaballos /></ProtectedRoute>} />
      <Route path="/preguntas" element={<ProtectedRoute><PreguntasAdmin /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
