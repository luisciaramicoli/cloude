import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Film, Star, MessageSquare } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import CommentsModal from '../components/CommentsModal';
import './Catalog.css';

const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null); // For comments modal
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Check auth implicitly by fetching favorites or a check route
      await api.get('/auth/check');
      
      const [moviesRes, favsRes] = await Promise.all([
        api.get('/movies'),
        api.get('/favorites')
      ]);

      setMovies(moviesRes.data);
      const favIds = new Set(favsRes.data.map(f => String(f.tmdb_movie_id)));
      setFavorites(favIds);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        console.error("Error fetching data", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  const toggleFavorite = async (movieId) => {
    const isFav = favorites.has(String(movieId));
    try {
      if (isFav) {
        await api.delete(`/favorites/${movieId}`);
        setFavorites(prev => {
          const newFavs = new Set(prev);
          newFavs.delete(String(movieId));
          return newFavs;
        });
      } else {
        await api.post('/favorites', { tmdb_movie_id: movieId });
        setFavorites(prev => new Set(prev).add(String(movieId)));
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
    }
  };

  return (
    <div className="catalog-container">
      <header className="catalog-header glass-panel">
        <div className="container header-content">
          <div className="brand">
            <Film className="brand-icon" size={32} />
            <h1>Tom Hanks Collection</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary logout-btn">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      <main className="container main-content animate-fade-in">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando filmes...</p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isFavorite={favorites.has(String(movie.id))}
                onToggleFavorite={() => toggleFavorite(movie.id)}
                onOpenComments={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedMovie && (
        <CommentsModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
};

export default Catalog;
