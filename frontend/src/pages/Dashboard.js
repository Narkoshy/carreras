import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css"; // Importamos el archivo CSS

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <p className="dashboard-kicker">Nurse Race</p>
        <h1 className="dashboard-title">Plataforma de gamificacio</h1>

        <div className="dashboard-grid">
          <button className="dashboard-card dashboard-card-g1" onClick={() => navigate("/grupo1")}>
            <span>Grup 1</span>
            <small>Entrar al qüestionari</small>
          </button>
          <button className="dashboard-card dashboard-card-g2" onClick={() => navigate("/grupo2")}>
            <span>Grup 2</span>
            <small>Entrar al qüestionari</small>
          </button>
          <button className="dashboard-card dashboard-card-g3" onClick={() => navigate("/grupo3")}>
            <span>Grup 3</span>
            <small>Entrar al qüestionari</small>
          </button>
          <button className="dashboard-card dashboard-card-race" onClick={() => navigate("/carrera")}>
            <span>Cursa de Camells</span>
            <small>Visualitzacio en temps real</small>
          </button>
          <button className="dashboard-card dashboard-card-admin" onClick={() => navigate("/preguntas")}>
            <span>Gestio de preguntes</span>
            <small>Crear, editar i esborrar</small>
          </button>
        </div>

        <button
          className="dashboard-logout"
          onClick={() => {
            localStorage.removeItem("authenticated");
            navigate("/");
          }}
        >
          Tancar sessio
        </button>
      </section>
      <div className="dashboard-glow" aria-hidden="true">
        <div />
        <div />
      </div>
    </main>
  );
}
