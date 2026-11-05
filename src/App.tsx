import { useState, useRef, useEffect } from 'react';
import { config } from './config';

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

function App() {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(config.streamUrl);
    const audio = audioRef.current;
    
    const handleWaiting = () => setStatus('loading');
    const handlePlaying = () => setStatus('playing');
    const handlePause = () => setStatus('paused');
    const handleError = () => setStatus('error');

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (status === 'playing') {
      audioRef.current.pause();
      setStatus('paused');
    } else {
      setStatus('loading');
      try {
        audioRef.current.load();
        await audioRef.current.play();
      } catch (err) {
        console.error('Error al reproducir:', err);
        setStatus('error');
      }
    }
  };

  // ===== SLEEP TIMER =====
  const setSleepTimer = (minutes: number) => {
    setSleepMinutes(minutes);
    setShowTimerModal(false);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (audioRef.current && status === 'playing') {
        audioRef.current.pause();
        setStatus('paused');
      }
      setSleepMinutes(null);
    }, minutes * 60 * 1000);
  };

  const cancelSleepTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSleepMinutes(null);
  };

  // ===== COMPARTIR POR WHATSAPP NATIVO =====
  const shareViaWhatsApp = () => {
    const shareText = `🎵 Escucha ${config.stationName} en vivo: ${window.location.href}`;
    
    // Detectar si es móvil
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // WhatsApp nativo (abre la app directamente)
      const nativeUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
      window.location.href = nativeUrl;
      
      // Fallback si no tiene WhatsApp instalado
      setTimeout(() => {
        window.location.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      }, 500);
    } else {
      // Desktop: usar wa.me (WhatsApp Web)
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Toca play para iniciar';
      case 'loading': return 'Conectando...';
      case 'playing': return 'Transmitiendo en vivo';
      case 'paused': return 'En pausa';
      case 'error': return 'Sin señal. Intenta de nuevo.';
      default: return '';
    }
  };

  const isPlaying = status === 'playing';

  return (
    <>
      <div className="animated-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>

      <div className="app-container">
        <div className="live-badge">
          <span className="live-dot"></span>
          EN VIVO
        </div>

        <div className="top-section">
          <div className="cover-art-container">
            {/* Ondas ripple */}
            <div className={`ripple ${isPlaying ? 'active' : ''}`}></div>
            <div className={`ripple ${isPlaying ? 'active' : ''}`}></div>
            <div className={`ripple ${isPlaying ? 'active' : ''}`}></div>
            
            <img 
              src={config.logoUrl} 
              alt="Logo de la emisora" 
              className={`logo ${isPlaying ? 'spinning' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWRCOTU0IiBzdHJva2Utd2lkdGg9IjEuNSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNOSAxMGMwLTEuMS45LTIgMi0yczIgLjkgMiAyLS45IDItMiAyLTIgMC0yLS45LTItMiIvPjxwYXRoIGQ9Ik0xMiAxNHYzIi8+PC9zdmc+';
              }}
            />
          </div>
          
          <div className="track-info">
            <h1>{config.stationName}</h1>
            <p className="slogan">{config.slogan}</p>
          </div>

          <div className="visualizer">
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
            <div className={`bar ${isPlaying ? 'active' : ''}`}></div>
          </div>
        </div>

        <div className="middle-section">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            disabled={status === 'loading'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {status === 'loading' ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : isPlaying ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          <p className={`status-text ${status === 'error' ? 'error' : ''}`}>
            {getStatusText()}
          </p>
        </div>

        <div className="bottom-section">
          <div className="action-buttons">
            {/* Botón Sleep Timer */}
            <button 
              className={`action-button ${sleepMinutes ? 'active-timer' : ''}`}
              onClick={() => setShowTimerModal(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {sleepMinutes ? `${sleepMinutes}m` : 'Dormir'}
            </button>

            {/* Botón Compartir por WhatsApp */}
            <button className="action-button whatsapp" onClick={shareViaWhatsApp}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Compartir
            </button>
          </div>

          <a 
            href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-button whatsapp"
            style={{ width: '100%' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Solicite su propia emisora
          </a>
        </div>
      </div>

      {/* Modal Sleep Timer */}
      {showTimerModal && (
        <div className="timer-modal-overlay" onClick={() => setShowTimerModal(false)}>
          <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⏰ Temporizador para dormir</h3>
            <div className="timer-options">
              {[15, 30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  className="timer-option"
                  onClick={() => setSleepTimer(min)}
                >
                  {min} min
                </button>
              ))}
              {sleepMinutes && (
                <button
                  className="timer-option"
                  onClick={cancelSleepTimer}
                  style={{ gridColumn: 'span 3', background: 'rgba(255, 77, 77, 0.2)', borderColor: '#ff4d4d' }}
                >
                  Cancelar temporizador ({sleepMinutes}m)
                </button>
              )}
            </div>
            <button className="timer-cancel" onClick={() => setShowTimerModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
