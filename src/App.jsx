import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// --- CONFIGURACIÓN ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const LOCATION_ID = 'Squash'; 

// --- Componente de Estrellas (sin cambios) ---
const StarRating = ({ rating, onRate }) => (
  <div className="star-rating">{[1, 2, 3, 4, 5].map(star => (<span key={star} className={star <= rating ? 'on' : 'off'} onClick={() => onRate(star)}>★</span>))}</div>
);

// --- Estado Inicial Limpio ---
const initialState = {
  step: 1,
  loading: false,
  selectedScore: null,
  ratings: { instalaciones: 0, limpieza: 0, atencion: 0, ambiente: 0, calidadPrecio: 0 },
  comment: '',
  animation: 'slide-in' // Estado para controlar la animación
};

function App() {
  const [state, setState] = useState(initialState);
  const { step, loading, selectedScore, ratings, comment, animation } = state;

  // --- Lógica para el reinicio automático ---
  useEffect(() => {
    let timer;
    if (step === 3) {
      timer = setTimeout(() => {
        setState({ ...initialState, animation: 'slide-in' });
      }, 5000); // Se reinicia después de 5 segundos
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleNpsSelect = (score) => {
    setState(prevState => ({ ...prevState, animation: 'slide-out' }));
    setTimeout(() => {
      setState(prevState => ({ ...prevState, selectedScore: score, step: 2, animation: 'slide-in' }));
    }, 300); // La duración debe coincidir con la animación CSS
  };

  const handleRatingChange = (aspect, value) => {
    setState(prevState => ({
      ...prevState,
      ratings: { ...prevState.ratings, [aspect]: value }
    }));
  };
  
  const handleSubmit = async () => {
    setState(prevState => ({ ...prevState, loading: true }));
    const { error } = await supabase.from('surveys').insert({ 
      score: selectedScore, 
      comment: comment, 
      location_id: LOCATION_ID,
      additional_ratings: ratings
    });

    if (error) {
      console.error('Error enviando la encuesta:', error);
      alert('Hubo un error al enviar tu respuesta.');
      setState(prevState => ({ ...prevState, loading: false }));
    } else {
      setState(prevState => ({ ...prevState, animation: 'slide-out' }));
      setTimeout(() => {
        setState(prevState => ({ ...prevState, step: 3, loading: false, animation: 'slide-in' }));
      }, 300);
    }
  };
  
  const getNpsButtonClass = (num) => {
    if (selectedScore === null) return '';
    if (num === selectedScore) {
      if (num <= 6) return 'selected red';
      if (num <= 8) return 'selected yellow';
      return 'selected green';
    }
    return 'dimmed';
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1>¿Qué tan probable es que recomiendes la zona de "{LOCATION_ID}"?</h1>
            <div className={`nps-scores ${selectedScore !== null ? 'selection-made' : ''}`}>
              {[...Array(11).keys()].map(num => (
                <button key={num} className={getNpsButtonClass(num)} onClick={() => handleNpsSelect(num)}>{num}</button>
              ))}
            </div>
            <div className="nps-labels"><span>Nada Probable</span><span>Muy Probable</span></div>
          </>
        );
      case 2:
        return (
          <>
            <h1>Califica tu experiencia con más detalle:</h1>
            <div className="additional-questions">
              <div className="question-item"><span>Instalaciones</span><StarRating rating={ratings.instalaciones} onRate={(v) => handleRatingChange('instalaciones', v)} /></div>
              <div className="question-item"><span>Limpieza</span><StarRating rating={ratings.limpieza} onRate={(v) => handleRatingChange('limpieza', v)} /></div>
              <div className="question-item"><span>Atención Recibida</span><StarRating rating={ratings.atencion} onRate={(v) => handleRatingChange('atencion', v)} /></div>
              <div className="question-item"><span>Ambiente y Comodidad</span><StarRating rating={ratings.ambiente} onRate={(v) => handleRatingChange('ambiente', v)} /></div>
              <div className="question-item"><span>Relación Calidad/Precio</span><StarRating rating={ratings.calidadPrecio} onRate={(v) => handleRatingChange('calidadPrecio', v)} /></div>
            </div>
            <label className="comment-label">Envíanos tus comentarios:</label>
            <textarea value={comment} onChange={(e) => setState(prevState => ({ ...prevState, comment: e.target.value }))} placeholder="Tu opinión es muy importante..." rows="3" />
            <button onClick={handleSubmit} disabled={loading} className="submit-button">{loading ? 'Enviando...' : 'Finalizar Encuesta'}</button>
          </>
        );
      case 3:
        return (
          <div className="thank-you-message">
            <div className="checkmark-circle"><div className="checkmark-stem"></div><div className="checkmark-kick"></div></div>
            <h2>¡Muchas gracias!</h2>
            <p>Tu opinión ha sido registrada. El formulario se reiniciará en 5 segundos.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="app-container">
      <div className="survey-card">
        <div className={`step-content ${animation}`}>{renderStepContent()}</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>
      </div>
    </div>
  );
}

export default App;