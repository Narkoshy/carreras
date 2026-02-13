const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const DATA_DIR = path.join(__dirname, 'data');
const PREGUNTAS_FILE = path.join(DATA_DIR, 'preguntas.json');
const GRUPOS_VALIDOS = new Set(['grupo1', 'grupo2', 'grupo3']);

const seedPreguntas = [
  {
    pregunta: 'Qui va descobrir les vacunes?',
    opciones: ['Edward Jener', 'Louis Pasteur', 'Alexander Fleming', 'Cristina i Sara'],
    correcta: 0,
  },
  {
    pregunta: 'A quina edat s’administra la vacuna TV?',
    opciones: ['12 mesos - 3 anys', '15 mesos - 3 anys', '9 mesos - 3 anys', 'dosis unica als 15 mesos'],
    correcta: 0,
  },
  {
    pregunta: 'A quina temperatura s’han de mantenir les vacunes a la nevera?',
    opciones: ['entre 3oC - 8 oC', 'no importa la temperatura', 'entre 2oC - 8oC', 'entre 2oC - 10oC'],
    correcta: 2,
  },
  {
    pregunta: 'Quants tipus de vacuna hi ha?',
    opciones: [
      'vacunes microorganismes sencers, de subunitats, d’ADN',
      'vacunes microorganismes sencers, de subunitats, d’ADN i toxoide',
      'vacunes vives-mortes, vives-bacterianes',
      'vacunes atenuades-inactivades, viriques i bacterianes',
    ],
    correcta: 1,
  },
  {
    pregunta:
      'Acut a la consulta pacient de 90 anys per vacunar-se de la vacuna de la grip. Actualment, nomes tenim al centre la vacuna de la grip adjuvada. Veient el seu historial vacunal, fa una setmana que la infermera d’atdom, li ha administrat la primera dosi de vacuna HZ. Que hem de fer?',
    opciones: [
      'Reprogramem visita a les 3 setmanes, per administrar-la conjuntament amb HZ',
      'Es pot administrar la vacuna de la grip',
      'Si administrem la vacuna de la grip, la vacuna HZ perd eficacia',
      'Reprogramem visita en dos dies que arriben les vacunes de la grip no adjuvada',
    ],
    correcta: 1,
  },
  {
    pregunta: 'Quan s’inicia la campanya de vacunacio gripal?',
    opciones: ['Setembre', 'Sempre podem vacunar de la grip', 'Octubre', 'Novembre'],
    correcta: 2,
  },
  {
    pregunta:
      'Pacient de 18 anys que li van administrar 1era dosi de vacuna de la varicel·la el 19/10/2024 i el 14/11/2024 per error li van administrar una dosi de vacuna shingrix. Davant aquest error, quina pauta s’ha de seguir?',
    opciones: [
      'Iniciar nova pauta de varicel·la, ja que no es comptabiltza com administrada',
      'Administrar 1 dosi de varicel·la, per completar pauta',
      'Administrar 1 dosi de varicel·la i 1 dosi de shingrix per completar pauta',
      'Demanar analitica per valorar anticossos de la varicel·la, per si fa falta completar pauta de varicel·la, ja que recorda haver patit la malaltia.',
    ],
    correcta: 1,
  },
  {
    pregunta: 'Assenyala la resposta incorrecta respecte al virus de l’hepatitis B (VHB)',
    opciones: [
      'VHB pot sobreviure fora de l\'organisme almenys 7 dies i pot causar infeccio si penetra en un altre organisme en aquest periode',
      'L\'hepatitis B es prevenible amb la vacuna actualment disponible',
      'El VHB es transmet pels aliments o aigues contaminades',
      'La infeccio cronica pel virus de l\'hepatitis B pot tractar-se amb medicaments, en particular amb agents antivirals orals',
    ],
    correcta: 2,
  },
  {
    pregunta: 'Quina es la via d’administracio mes utilitzada per administrar les vacunes?',
    opciones: ['SC', 'intradermica', 'oral', 'IM'],
    correcta: 3,
  },
  {
    pregunta: 'A quin any es va instaurar el primer calendari sistematic a Espanya?',
    opciones: ['1981', '1968', '1975', '1970'],
    correcta: 2,
  },
  {
    pregunta:
      'En una escola bressol han detectat un cas de xarampio. Acut a la consulta un nen de 9 mesos per ser vacunat segons indicacio de Salut publica, que fem?',
    opciones: [
      'No podem administrar, doncs seguint calendari, la vacuna de la TV s’administra als 12 mesos',
      'Li administrem la vacuna TV, i caldra seguir pauta segons calendari',
      'Li administrem la vacuna TV, avancant la dels 12 mesos, i aquesta queda registrada com a primera dosi.',
      'Abans d’administrar, pregunto a la referent de vacunes del centre',
    ],
    correcta: 1,
  },
  {
    pregunta: 'Quan es va iniciar la vacunacio del COVID a Espanya?',
    opciones: ['Febrer 2021', 'Setembre 2021', 'Desembre 2019', 'Desembre 2020'],
    correcta: 3,
  },
  {
    pregunta: 'Acut adolescent de 17 anys, sense factors de risc, per administrar la vacuna VPH9.',
    opciones: [
      'Li administrem 1 dosis, la te financada',
      'Administrem 1 dosis, no la te financada',
      'Administrem 2 dosis, les te financades (0-5 mesos)',
      'Administrem 3 dosis, les te financades (0-2-6 mesos)',
    ],
    correcta: 0,
  },
  {
    pregunta:
      'La serie d\'elements i activitats necessaries per a garantir la potencia immunitzadora de les vacunes des de la seva fabricacio fins a l\'administracio d\'aquestes a la poblacio, es defineix com:',
    opciones: ['Cadena del fred', 'Cadena de transport', 'Transport actiu', 'Conservacio positiva'],
    correcta: 0,
  },
  {
    pregunta: 'Quines dues vacunes no es poden posar juntes?',
    opciones: ['Varicel·la i triple virica', 'Varicel·la i febre groga', 'Triple virica i febre groga', 'Totes es poden administrar conjuntament'],
    correcta: 2,
  },
  {
    pregunta:
      'Nen de 19 anys que acut a consulta per seguir calendari accelerat de vacunacions. No ha passat la varicel·la. Segons nota infermera avui cal administrar VVZ i TV. Revisant calendari, fa 15 dies li van administrar VPH9 + TV i tambe te pendent administrar meningitis i HA. Quines vacunes cal administrar?',
    opciones: [
      'Administrem TV + VVZ, segons nota infermera',
      'Administrem VPH9 + MACWY',
      'Administrem HA + MACWY',
      'Reprogramem visita amb la seva infermera',
    ],
    correcta: 2,
  },
  {
    pregunta:
      'Acut pacient de 36 anys per realitzacio de PAPPS. Al preguntar sobre riscs d’ITS, comenta que mante relacions amb homes. Expliquem vacunacio del papil·loma i accepta administracio de la vacuna.',
    opciones: [
      'Administrem una dosi, ja que la te financada',
      'Administrem 3 dosis amb pauta: 0-6-12 mesos, ja que la te financada',
      'Administrem 2 dosis amb pauta 0-6, ja que la te financada',
      'No administrem, ja que no esta financada per l’edat que te. Li recomanem que la compri. Pauta a seguir: 3 dosis 0-1-6 mesos',
    ],
    correcta: 2,
  },
  {
    pregunta:
      'Acut a la consulta adolescent de 16 anys, doncs a la seva escola hi ha un brot de tos ferina. Revisem calendari historia clinica i veiem que li falta la Td dels 14 anys. La seva mare ens diu que fa un any que va patir la tosferina. Que fem?',
    opciones: [
      'Vacunem 1 dosi de Td, per seguir calendari.',
      'No administrem cap vacuna, ja que ha patit la tos ferina.',
      'Vacunem 1 dosi de Dtpa',
      'Vacunem 1 dosi de Td i recitem per administrar una dosi de VPH9.',
    ],
    correcta: 2,
  },
  {
    pregunta: 'Respecte la vacuna antipneumococia, es cert que?',
    opciones: [
      'Interval entre Pn23 i Pn20 es de 6m',
      'Interval entre Pn13 i Pn20 es de 12m',
      'Interval entre Pn20 i Pn23 es de 6 m',
      'Interval entre Pn23 i Pn20 es de 12m',
    ],
    correcta: 3,
  },
  {
    pregunta: 'Acut a la consulta una mare de 50 anys explicant que a l’escola del seu fill hi ha un brot de xarampio. Que fem?',
    opciones: [
      'Administrem 1 dosi de TV i citem al mes per administrar la 2a dosi.',
      'Demanem analitica per mirar anticossos',
      'No farem res, ja que per edat segur que ha passat la malaltia',
      'Administrem 1 dosi de TV',
    ],
    correcta: 0,
  },
];

let preguntas = [];
let progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
let carreraFinalizada = false;

app.use(cors());
app.use(express.json());

function getPuntosNecesarios() {
  return Math.max(1, preguntas.length);
}

function normalizarPregunta(raw) {
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    pregunta: String(raw.pregunta || '').trim(),
    opciones: Array.isArray(raw.opciones) ? raw.opciones.map((opcion) => String(opcion || '').trim()) : [],
    correcta: Number(raw.correcta),
  };
}

function validarPreguntaPayload(raw) {
  const pregunta = normalizarPregunta(raw);

  if (!pregunta.pregunta) {
    return { ok: false, error: 'La pregunta es obligatoria.' };
  }

  if (!Array.isArray(pregunta.opciones) || pregunta.opciones.length !== 4) {
    return { ok: false, error: 'Debes indicar exactamente 4 opciones.' };
  }

  if (pregunta.opciones.some((opcion) => !opcion)) {
    return { ok: false, error: 'Ninguna opcion puede estar vacia.' };
  }

  if (!Number.isInteger(pregunta.correcta) || pregunta.correcta < 0 || pregunta.correcta >= pregunta.opciones.length) {
    return { ok: false, error: 'La respuesta correcta no es valida.' };
  }

  return { ok: true, pregunta };
}

function savePreguntas() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PREGUNTAS_FILE, JSON.stringify(preguntas, null, 2), 'utf-8');
}

function loadPreguntas() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(PREGUNTAS_FILE)) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
    savePreguntas();
    return;
  }

  const contenido = fs.readFileSync(PREGUNTAS_FILE, 'utf-8');
  const parsed = JSON.parse(contenido);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
    savePreguntas();
    return;
  }

  preguntas = parsed
    .map((pregunta) => {
      const result = validarPreguntaPayload(pregunta);
      if (!result.ok) {
        return null;
      }
      return { ...result.pregunta, id: pregunta.id || crypto.randomUUID() };
    })
    .filter(Boolean);

  if (preguntas.length === 0) {
    preguntas = seedPreguntas.map((pregunta) => ({ ...normalizarPregunta(pregunta) }));
  }

  savePreguntas();
}

function getEstadoCarrera() {
  return {
    progreso: progresoGrupos,
    carreraFinalizada,
    puntosNecesarios: getPuntosNecesarios(),
  };
}

function resetCarrera() {
  progresoGrupos = { grupo1: 0, grupo2: 0, grupo3: 0 };
  carreraFinalizada = false;
}

function emitirEstadoCarrera() {
  io.emit('actualizarCarrera', getEstadoCarrera());
}

loadPreguntas();

app.get('/preguntas', (_req, res) => {
  res.json(preguntas);
});

app.post('/preguntas', (req, res) => {
  const result = validarPreguntaPayload(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const nuevaPregunta = { ...result.pregunta, id: crypto.randomUUID() };
  preguntas.push(nuevaPregunta);
  savePreguntas();

  return res.status(201).json(nuevaPregunta);
});

app.put('/preguntas/:id', (req, res) => {
  const { id } = req.params;
  const index = preguntas.findIndex((pregunta) => pregunta.id === id);

  if (index < 0) {
    return res.status(404).json({ error: 'Pregunta no encontrada.' });
  }

  const result = validarPreguntaPayload({ ...req.body, id });
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  preguntas[index] = result.pregunta;
  savePreguntas();

  return res.json(preguntas[index]);
});

app.delete('/preguntas/:id', (req, res) => {
  const { id } = req.params;

  if (preguntas.length <= 1) {
    return res.status(400).json({ error: 'Debe existir al menos una pregunta en el cuestionario.' });
  }

  const index = preguntas.findIndex((pregunta) => pregunta.id === id);
  if (index < 0) {
    return res.status(404).json({ error: 'Pregunta no encontrada.' });
  }

  preguntas.splice(index, 1);
  savePreguntas();

  if (carreraFinalizada) {
    resetCarrera();
    emitirEstadoCarrera();
  }

  return res.status(204).send();
});

app.get('/estado', (_req, res) => {
  res.json(getEstadoCarrera());
});

app.post('/responder', (req, res) => {
  const { grupo, indexPregunta, respuesta } = req.body;
  const preguntaIndex = Number(indexPregunta);
  const respuestaIndex = Number(respuesta);

  if (!GRUPOS_VALIDOS.has(grupo)) {
    return res.status(400).json({ error: 'Grupo invalido.' });
  }

  if (!Number.isInteger(preguntaIndex) || preguntaIndex < 0 || preguntaIndex >= preguntas.length) {
    return res.status(400).json({ error: 'Indice de pregunta invalido.' });
  }

  if (!Number.isInteger(respuestaIndex)) {
    return res.status(400).json({ error: 'Respuesta invalida.' });
  }

  if (carreraFinalizada) {
    return res.json({
      mensaje: 'La carrera ha terminado. Reinicia para jugar de nuevo.',
      progreso: progresoGrupos[grupo],
      estado: getEstadoCarrera(),
    });
  }

  const acierto = preguntas[preguntaIndex].correcta === respuestaIndex;

  if (acierto) {
    progresoGrupos[grupo] += 1;

    if (progresoGrupos[grupo] >= getPuntosNecesarios()) {
      carreraFinalizada = true;
      io.emit('carreraFinalizada', { ganador: grupo });
    }
  } else {
    progresoGrupos[grupo] = 0;
  }

  emitirEstadoCarrera();

  return res.json({
    progreso: progresoGrupos[grupo],
    acierto,
    estado: getEstadoCarrera(),
  });
});

app.post('/reiniciar', (_req, res) => {
  resetCarrera();
  emitirEstadoCarrera();
  res.json({ mensaje: 'Carrera reiniciada correctamente.' });
});

io.on('connection', (socket) => {
  socket.emit('actualizarCarrera', getEstadoCarrera());

  socket.on('reiniciarCarrera', () => {
    resetCarrera();
    emitirEstadoCarrera();
  });
});

server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.log('Servidor funcionando en el puerto 4000');
});
