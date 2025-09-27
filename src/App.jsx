import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// --- CONFIGURACIÓN ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MODIFICA AQUÍ LA UBICACIÓN PARA CADA TABLET
const LOCATION_ID = 'Squash'; 

// Componente para las estrellas de calificación
const StarRating = ({ rating, onRate }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= rating ? 'on' : 'off'} onClick={() => onRate(star)}>
          ★
        </span>
      ))}
    </div>
  );
};

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Datos de la encuesta
  const [selectedScore, setSelectedScore] = useState(null);
  const [ratings, setRatings] = useState({
    instalaciones: 0,
    limpieza: 0,
    atencion: 0,
    ambiente: 0,
    calidadPrecio: 0
  });
  const [comment, setComment] = useState('');

  const handleNpsSelect = (score) => {
    setSelectedScore(score);
    // Pequeña pausa para que el usuario vea la animación del color
    setTimeout(() => {
      setStep(2);
    }, 400);
  };

  const handleRatingChange = (aspect, value) => {
    setRatings(prevRatings => ({ ...prevRatings, [aspect]: value }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('surveys').insert({ 
      score: selectedScore, 
      comment: comment, 
      location_id: LOCATION_ID,
      additional_ratings: ratings
    });

    if (error) {
      console.error('Error enviando la encuesta:', error);
      alert('Hubo un error al enviar tu respuesta.');
    } else {
      setStep(3);
    }
    setLoading(false);
  };
  
  // Función para asignar clases de color a los botones NPS
  const getNpsButtonClass = (num) => {
    if (selectedScore === null) return '';
    if (num === selectedScore) {
      if (num <= 6) return 'selected red';
      if (num <= 8) return 'selected yellow';
      return 'selected green';
    }
    return 'dimmed';
  };

  const renderStep = () => {
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
            <div className="nps-labels">
              <span>Nada Probable</span>
              <span>Muy Probable</span>
            </div>
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
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tu opinión es muy importante para nosotros..."
              rows="3"
            />
            <button onClick={handleSubmit} disabled={loading} className="submit-button">
              {loading ? 'Enviando...' : 'Finalizar Encuesta'}
            </button>
          </>
        );
      case 3:
        return (
          <div className="thank-you-message">
            <h2>¡Muchas gracias!</h2>
            <p>Tu feedback ha sido registrado.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="survey-card">
        {renderStep()}
      </div>
    </div>
  );
}

export default App;