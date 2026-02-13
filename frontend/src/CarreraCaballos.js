import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from './config';
import './CarreraCaballos.css';

const socket = io(API_URL, { transports: ['websocket', 'polling'] });

function normalizeEstado(payload) {
  if (payload && payload.progreso) {
    return {
      progreso: payload.progreso,
      puntosNecesarios: payload.puntosNecesarios || 20,
      carreraFinalizada: Boolean(payload.carreraFinalizada),
    };
  }

  return {
    progreso: payload || { grupo1: 0, grupo2: 0, grupo3: 0 },
    puntosNecesarios: 20,
    carreraFinalizada: false,
  };
}

const CarreraCaballos = () => {
  const [progreso, setProgreso] = useState({ grupo1: 0, grupo2: 0, grupo3: 0 });
  const [ganador, setGanador] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const [puntosNecesarios, setPuntosNecesarios] = useState(20);

  useEffect(() => {
    const loadEstadoInicial = async () => {
      try {
        const response = await axios.get(`${API_URL}/estado`);
        const estado = normalizeEstado(response.data);
        setProgreso(estado.progreso);
        setPuntosNecesarios(estado.puntosNecesarios);
      } catch (_err) {
        // fallback a valores por defecto
      }
    };

    loadEstadoInicial();

    socket.on('actualizarCarrera', (payload) => {
      const estado = normalizeEstado(payload);
      setProgreso(estado.progreso);
      setPuntosNecesarios(estado.puntosNecesarios);

      Object.entries(estado.progreso).forEach(([grupo, avance]) => {
        if (avance >= estado.puntosNecesarios) {
          setGanador(grupo);
          setEnMarcha(false);
        }
      });
    });

    return () => {
      socket.off('actualizarCarrera');
    };
  }, []);

  useEffect(() => {
    let intervalo;
    if (enMarcha) {
      intervalo = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [enMarcha]);

  const iniciarCarrera = () => {
    setTiempo(0);
    setGanador(null);
    setEnMarcha(true);
  };

  const reiniciarCarrera = async () => {
    try {
      await axios.post(`${API_URL}/reiniciar`);
      setProgreso({ grupo1: 0, grupo2: 0, grupo3: 0 });
      setTiempo(0);
      setGanador(null);
      setEnMarcha(false);
    } catch (_err) {
      // sin cambios de estado si falla
    }
  };

  return (
    <main className="race-shell">
      <section className="race-card">
        <header className="race-header">
          <p>Cursa en directe</p>
          <h1>Cursa de Camells</h1>
          <div className="race-status">
            <span>Temps: {tiempo}s</span>
            <span>Meta: {puntosNecesarios} encerts</span>
          </div>
        </header>

        {!enMarcha && !ganador ? (
          <button className="race-primary" onClick={iniciarCarrera}>
            Iniciar cronometre
          </button>
        ) : null}

        {ganador ? (
          <div className="race-winner">
            <h2>{ganador} ha guanyat en {tiempo} segons.</h2>
            <button className="race-reset" onClick={reiniciarCarrera}>Reiniciar carrera</button>
          </div>
        ) : (
          <div className="race-lanes">
            {Object.entries(progreso).map(([grupo, avance]) => {
              const percent = Math.min(100, (avance / puntosNecesarios) * 100);
              const label = grupo === 'grupo1' ? 'Grup 1' : grupo === 'grupo2' ? 'Grup 2' : 'Grup 3';

              return (
                <article className="race-lane" key={grupo}>
                  <div className="race-lane-head">
                    <h2>{label}</h2>
                    <p>{avance}/{puntosNecesarios}</p>
                  </div>
                  <div className="race-track">
                    <div className="race-track-fill" style={{ width: `${percent}%` }} />
                    <img src="/caballo.png" alt="camell" style={{ left: `${percent}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default CarreraCaballos;
