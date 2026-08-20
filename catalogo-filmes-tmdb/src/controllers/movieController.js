const axios = require('axios');
const { pool } = require('../config/db');

// TMDB endpoints
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TOM_HANKS_ID = 31; // Tom Hanks ID on TMDB

const getTomHanksMovies = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return res.status(500).json({ error: 'TMDB API KEY não configurada no servidor.' });
    }

    // Call TMDB API from server
    const response = await axios.get(`${TMDB_BASE_URL}/person/${TOM_HANKS_ID}/movie_credits`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR'
      }
    });

    const movies = response.data.cast.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date
    }));

    res.json(movies);
  } catch (error) {
    console.error('Erro ao buscar filmes no TMDB:', error.message);
    res.status(500).json({ error: 'Erro ao comunicar com TMDB' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { tmdb_movie_id, titulo, poster_path } = req.body;

    await pool.query(
      'INSERT INTO favoritos (usuario_id, tmdb_movie_id, titulo, poster_path) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE titulo = titulo',
      [usuario_id, tmdb_movie_id, titulo, poster_path]
    );

    res.status(201).json({ message: 'Filme adicionado aos favoritos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao favoritar filme' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const [rows] = await pool.query('SELECT * FROM favoritos WHERE usuario_id = ?', [usuario_id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { tmdb_movie_id } = req.params;
    await pool.query('DELETE FROM favoritos WHERE usuario_id = ? AND tmdb_movie_id = ?', [usuario_id, tmdb_movie_id]);
    res.json({ message: 'Favorito removido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
};

const addComment = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { tmdb_movie_id, texto } = req.body;

    await pool.query(
      'INSERT INTO comentarios (usuario_id, tmdb_movie_id, texto) VALUES (?, ?, ?)',
      [usuario_id, tmdb_movie_id, texto]
    );

    res.status(201).json({ message: 'Comentário adicionado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
};

const getComments = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { tmdb_movie_id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, texto, criado_em FROM comentarios WHERE usuario_id = ? AND tmdb_movie_id = ? ORDER BY criado_em DESC',
      [usuario_id, tmdb_movie_id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
};

module.exports = {
  getTomHanksMovies,
  addFavorite,
  getFavorites,
  removeFavorite,
  addComment,
  getComments
};
