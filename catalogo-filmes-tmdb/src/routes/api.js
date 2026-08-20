const express = require('express');
const { register, login, logout, checkAuth } = require('../controllers/authController');
const { 
  getTomHanksMovies, 
  addFavorite, 
  getFavorites, 
  removeFavorite, 
  addComment, 
  getComments 
} = require('../controllers/movieController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/check', authMiddleware, checkAuth);

// Movie/TMDB routes
router.get('/movies', authMiddleware, getTomHanksMovies);

// Favorites routes
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites/:tmdb_movie_id', authMiddleware, removeFavorite);

// Comments routes
router.get('/comments/:tmdb_movie_id', authMiddleware, getComments);
router.post('/comments', authMiddleware, addComment);

module.exports = router;
