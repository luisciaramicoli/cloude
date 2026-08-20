import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

const MovieCard = ({ movie, isFavorite, onToggleFavorite, onOpenComments }) => {
  // Use a fallback image if poster_path is null
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://placehold.co/500x750/1a1a1a/ffffff?text=Sem+Poster';

  return (
    <div className="movie-card">
      <div className="movie-poster-wrapper">
        <img src={posterUrl} alt={movie.title} className="movie-poster" loading="lazy" />
        <div className="movie-overlay">
          <div className="movie-actions">
            <button 
              className={`action-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={onToggleFavorite}
              title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            >
              <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button 
              className="action-btn"
              onClick={onOpenComments}
              title="Comentários"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
          <span>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
        </div>
        <p className="movie-desc">{movie.overview || 'Sem descrição disponível.'}</p>
      </div>
    </div>
  );
};

export default MovieCard;
