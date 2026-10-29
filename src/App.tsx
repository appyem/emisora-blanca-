import { useState, useRef, useEffect } from 'react';
import { config } from './config';

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

function App() {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`;
  const isPlaying = status === 'playing';

  return (
    <div className="app-container">
      <div className="live-badge">
        <span className="live-dot"></span>
        EN VIVO
      </div>

      <div className="cover-art-container">
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
      </div>

      <button 
        className={`play-button ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        disabled={status === 'loading'}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {status === 'loading' ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : isPlaying ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        )}
      </button>

      <p className={`status-text ${status === 'error' ? 'error' : ''}`}>
        {getStatusText()}
      </p>

      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Solicite su propia emisora
      </a>
    </div>
  );
}

export default App;
