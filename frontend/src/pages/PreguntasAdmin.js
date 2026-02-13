import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './PreguntasAdmin.css';

const emptyForm = {
  pregunta: '',
  opciones: ['', '', '', ''],
  correcta: 0,
};

function normalizeForm(raw) {
  return {
    pregunta: raw.pregunta || '',
    opciones: Array.isArray(raw.opciones) && raw.opciones.length === 4 ? raw.opciones : ['', '', '', ''],
    correcta: Number.isInteger(raw.correcta) ? raw.correcta : 0,
  };
}

export default function PreguntasAdmin() {
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const sortedPreguntas = useMemo(() => preguntas, [preguntas]);

  useEffect(() => {
    fetchPreguntas();
  }, []);

  async function fetchPreguntas() {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/preguntas`);
      setPreguntas(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las preguntas.');
    } finally {
      setLoading(false);
    }
  }

  function handleOptionChange(index, value) {
    setForm((prev) => {
      const next = [...prev.opciones];
      next[index] = value;
      return { ...prev, opciones: next };
    });
  }

  function startEdit(pregunta) {
    setEditingId(pregunta.id);
    setForm(normalizeForm(pregunta));
    setFeedback('Editando pregunta seleccionada.');
  }

  function resetEditor() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFeedback('');

    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/preguntas/${editingId}`, form);
        setPreguntas((prev) => prev.map((pregunta) => (pregunta.id === editingId ? response.data : pregunta)));
        setFeedback('Pregunta actualizada.');
      } else {
        const response = await axios.post(`${API_URL}/preguntas`, form);
        setPreguntas((prev) => [...prev, response.data]);
        setFeedback('Pregunta creada.');
      }
      resetEditor();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la pregunta.');
    }
  }

  async function handleDelete(id) {
    setError('');
    setFeedback('');
    if (!window.confirm('Quieres eliminar esta pregunta?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/preguntas/${id}`);
      setPreguntas((prev) => prev.filter((pregunta) => pregunta.id !== id));
      if (editingId === id) {
        resetEditor();
      }
      setFeedback('Pregunta eliminada.');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la pregunta.');
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Editor de contingut</p>
            <h1>Gestio de preguntes</h1>
          </div>
          <div className="admin-actions">
            <button className="ghost" onClick={() => navigate('/dashboard')}>Tornar al dashboard</button>
            <button
              className="ghost"
              onClick={() => {
                resetEditor();
                setFeedback('');
              }}
            >
              Nova pregunta
            </button>
          </div>
        </header>

        {error && <p className="admin-message error">{error}</p>}
        {feedback && <p className="admin-message ok">{feedback}</p>}

        <div className="admin-layout">
          <form className="editor-card" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar pregunta' : 'Crear pregunta'}</h2>

            <label>
              Enunciat
              <textarea
                value={form.pregunta}
                onChange={(e) => setForm((prev) => ({ ...prev, pregunta: e.target.value }))}
                rows={4}
                required
              />
            </label>

            {form.opciones.map((opcion, index) => (
              <label key={`op-${index}`}>
                Opcio {index + 1}
                <input
                  type="text"
                  value={opcion}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
              </label>
            ))}

            <label>
              Resposta correcta
              <select
                value={form.correcta}
                onChange={(e) => setForm((prev) => ({ ...prev, correcta: Number(e.target.value) }))}
              >
                {form.opciones.map((_opcion, index) => (
                  <option value={index} key={`correcta-${index}`}>
                    Opcio {index + 1}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="primary">
              {editingId ? 'Guardar canvis' : 'Afegir pregunta'}
            </button>
          </form>

          <aside className="list-card">
            <h2>Preguntes ({sortedPreguntas.length})</h2>
            {loading ? <p>Carregant...</p> : null}
            {!loading && sortedPreguntas.length === 0 ? <p>Encara no hi ha preguntes.</p> : null}

            <ul>
              {sortedPreguntas.map((pregunta, idx) => (
                <li key={pregunta.id}>
                  <p>
                    <span>{idx + 1}. </span>
                    {pregunta.pregunta}
                  </p>
                  <div>
                    <button className="ghost" onClick={() => startEdit(pregunta)}>Editar</button>
                    <button className="danger" onClick={() => handleDelete(pregunta.id)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
