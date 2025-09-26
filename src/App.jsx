import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey); // <-- ¡ESTA ES LA LÍNEA CLAVE!

// IDENTIFICADOR ÚNICO DE ESTA TABLET
const LOCATION_ID = 'CABALLERIZAS_01'; 

function App() {
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [step, setStep] = useState(1); // 1: Score, 2: Comment, 3: Thanks
  const [loading, setLoading] = useState(false);

  const handleScoreSelect = (selectedScore) => {
    setScore(selectedScore);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (score === null) return;
    setLoading(true);

    const { error } = await supabase
      .from('surveys')
      .insert({ score: score, comment: comment, location_id: LOCATION_ID });

    if (error) {
      console.error('Error enviando la encuesta:', error);
      alert('Hubo un error al enviar tu respuesta. Por favor, intenta de nuevo.');
    } else {
      setStep(3);
    }
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div className="card">
        <h1>¡Gracias por tu opinión!</h1>
        <p>Tu respuesta nos ayuda a mejorar día a día.</p>
      </div>
    );
  }

  return (
    <div className="card">
      {step === 1 && (
        <>
          <h1>¿Qué tan probable es que recomiendes la zona de "{LOCATION_ID}"?</h1>
          <div className="nps-scores">
            {[...Array(11).keys()].map(num => (
              <button key={num} onClick={() => handleScoreSelect(num)}>
                {num}
              </button>
            ))}
          </div>
          <div className="nps-labels">
            <span>Nada Probable</span>
            <span>Muy Probable</span>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1>Tu calificación: {score}</h1>
          <h2>¿Hay algo que quieras agregar? (Opcional)</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tus comentarios son muy valiosos..."
            rows="4"
          />
          <button onClick={handleSubmit} disabled={loading} className="submit-button">
            {loading ? 'Enviando...' : 'Enviar Opinión'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;