import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import api from '../services/api';

const CommentsModal = ({ movie, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [movie.id]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/comments/${movie.id}`);
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/comments', {
        tmdb_movie_id: movie.id,
        comment: newComment.trim()
      });
      setNewComment('');
      fetchComments(); // Refresh list
    } catch (err) {
      console.error("Error posting comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Comentários: {movie.title}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="comment-empty">Carregando comentários...</div>
          ) : comments.length === 0 ? (
            <div className="comment-empty">
              Nenhum comentário ainda. Seja o primeiro!
            </div>
          ) : (
            <div className="comments-list">
              {comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-author">Usuário #{c.user_id}</div>
                  <div className="comment-text">{c.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <form onSubmit={handleSubmit} className="comment-form">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !newComment.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
