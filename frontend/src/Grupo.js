import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import './Grupo.css';

const grupoLabel = {
  grupo1: 'Grup 1',
  grupo2: 'Grup 2',
  grupo3: 'Grup 3',
};

const Grupo = ({ grupo }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carreraFinalizada, setCarreraFinalizada] = useState(false);

  const preguntaActual = useMemo(() => preguntas[indiceActual], [preguntas, indiceActual]);

  useEffect(() => {
    const fetchPreguntas = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/preguntas`);
        setPreguntas(response.data || []);
      } catch (_err) {
        setError('No se pudieron cargar las preguntas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, []);

  const responder = async (indiceRespuesta) => {
    if (carreraFinalizada || !preguntaActual) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/responder`, {
        grupo,
        indexPregunta: indiceActual,
        respuesta: indiceRespuesta,
      });

      if (response.data?.mensaje) {
        setCarreraFinalizada(true);
        setMensaje('La carrera ha finalizado. Reinicia para volver a jugar.');
        return;
      }

      if (response.data?.acierto) {
        const siguienteIndice = indiceActual + 1;
        if (siguienteIndice >= preguntas.length) {
          setCarreraFinalizada(true);
          setMensaje('Has completado el cuestionario de este grupo.');
        } else {
          setIndiceActual(siguienteIndice);
          setMensaje('Resposta correcta.');
        }
      } else {
        setIndiceActual(0);
        setMensaje('Respuesta incorrecta. Vuelves al inicio.');
      }
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al enviar la respuesta.');
    }
  };

  const reiniciarCarrera = async () => {
    try {
      await axios.post(`${API_URL}/reiniciar`);
      setIndiceActual(0);
      setMensaje('Carrera reiniciada.');
      setCarreraFinalizada(false);
    } catch (_err) {
      setMensaje('Error al reiniciar la carrera.');
    }
  };

  return (
    <main className="quiz-shell">
      <section className="quiz-card">
        <p className="quiz-kicker">{grupoLabel[grupo] || 'Grup'}</p>
        <h1>Qüestionari</h1>

        {loading ? <p className="quiz-note">Carregant preguntes...</p> : null}
        {error ? <p className="quiz-note quiz-error">{error}</p> : null}

        {!loading && !error && preguntaActual && !carreraFinalizada ? (
          <>
            <p className="quiz-counter">
              Pregunta {indiceActual + 1} de {preguntas.length}
            </p>
            <h2 className="quiz-question">{preguntaActual.pregunta}</h2>
            <div className="quiz-options">
              {preguntaActual.opciones.map((opcion, index) => (
                <button key={`${preguntaActual.id}-${index}`} onClick={() => responder(index)}>
                  {opcion}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !error && (!preguntaActual || carreraFinalizada) ? (
          <div className="quiz-finished">
            <h2>Sessio finalitzada</h2>
            <p>Pots reiniciar la carrera o tornar al dashboard.</p>
            <button onClick={reiniciarCarrera}>Reiniciar carrera</button>
          </div>
        ) : null}

        {mensaje ? <p className="quiz-note">{mensaje}</p> : null}
      </section>
    </main>
  );
};

export default Grupo;
