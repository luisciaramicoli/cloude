const API_URL = '/api';

// State
let user = null;
let movies = [];
let favorites = [];
let currentMovieId = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const catalogSection = document.getElementById('catalog-section');
const userInfo = document.getElementById('user-info');
const userNameEl = document.getElementById('user-name');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const moviesGrid = document.getElementById('movies-grid');
const commentModal = document.getElementById('comment-modal');
const closeModal = document.querySelector('.close-btn');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentText = document.getElementById('comment-text');
const modalMovieTitle = document.getElementById('modal-movie-title');
const btnLogout = document.getElementById('btn-logout');

// Initialization
async function init() {
  await checkAuth();
  setupEventListeners();
}

// Authentication
async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/auth/check`);
    const data = await res.json();
    if (data.authenticated) {
      user = data.user;
      showCatalog();
    } else {
      showAuth();
    }
  } catch (err) {
    showAuth();
  }
}

// Event Listeners
function setupEventListeners() {
  // Tabs
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Forms
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (res.ok) {
        user = data.user;
        showCatalog();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Erro no login');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-password').value;
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      if (res.ok) {
        alert('Cadastro realizado! Faça login.');
        tabLogin.click();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Erro no cadastro');
    }
  });

  btnLogout.addEventListener('click', async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    user = null;
    showAuth();
  });

  // Modal
  closeModal.addEventListener('click', () => {
    commentModal.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    if (e.target === commentModal) {
      commentModal.classList.add('hidden');
    }
  });

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentMovieId) return;

    try {
      await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tmdb_movie_id: currentMovieId, 
          texto: commentText.value 
        })
      });
      commentText.value = '';
      loadComments(currentMovieId);
    } catch (err) {
      alert('Erro ao enviar comentário');
    }
  });
}

// Views
function showAuth() {
  authSection.classList.remove('hidden');
  catalogSection.classList.add('hidden');
  userInfo.classList.add('hidden');
}

function showCatalog() {
  authSection.classList.add('hidden');
  catalogSection.classList.remove('hidden');
  userInfo.classList.remove('hidden');
  userNameEl.textContent = `Olá, ${user.nome}`;
  
  loadMoviesAndFavorites();
}

async function loadMoviesAndFavorites() {
  try {
    const [moviesRes, favsRes] = await Promise.all([
      fetch(`${API_URL}/movies`),
      fetch(`${API_URL}/favorites`)
    ]);

    if (!moviesRes.ok) {
      if(moviesRes.status === 500) {
        alert('Erro no servidor ao buscar filmes. A chave da TMDB pode não estar configurada.');
      }
      movies = [];
    } else {
      movies = await moviesRes.json();
    }

    if (!favsRes.ok) {
      favorites = [];
    } else {
      favorites = await favsRes.json();
    }
    
    renderMovies();
  } catch (err) {
    console.error(err);
  }
}

function renderMovies() {
  moviesGrid.innerHTML = '';
  const favIds = new Set(favorites.map(f => f.tmdb_movie_id));

  movies.forEach(movie => {
    const isFav = favIds.has(movie.id);
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://placehold.co/500x750/1a1a1a/ffffff?text=Sem+Poster';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-overview">${movie.overview || 'Sem sinopse.'}</p>
        <div class="movie-actions">
          <button class="btn btn-outline btn-comment" data-id="${movie.id}" data-title="${movie.title}">
            Comentários
          </button>
          <button class="btn-icon btn-favorite ${isFav ? 'active' : ''}" data-id="${movie.id}" data-title="${movie.title}" data-poster="${movie.poster_path}">
            ${isFav ? '♥' : '♡'}
          </button>
        </div>
      </div>
    `;
    moviesGrid.appendChild(card);
  });

  // Attach dynamic listeners
  document.querySelectorAll('.btn-favorite').forEach(btn => {
    btn.addEventListener('click', handleFavorite);
  });

  document.querySelectorAll('.btn-comment').forEach(btn => {
    btn.addEventListener('click', openCommentModal);
  });
}

async function handleFavorite(e) {
  const btn = e.target;
  const tmdb_movie_id = btn.dataset.id;
  const titulo = btn.dataset.title;
  const poster_path = btn.dataset.poster;
  const isFav = btn.classList.contains('active');

  try {
    if (isFav) {
      await fetch(`${API_URL}/favorites/${tmdb_movie_id}`, { method: 'DELETE' });
      btn.classList.remove('active');
      btn.textContent = '♡';
    } else {
      await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdb_movie_id, titulo, poster_path })
      });
      btn.classList.add('active');
      btn.textContent = '♥';
    }
  } catch (err) {
    alert('Erro ao favoritar');
  }
}

async function openCommentModal(e) {
  currentMovieId = e.target.dataset.id;
  modalMovieTitle.textContent = e.target.dataset.title;
  commentModal.classList.remove('hidden');
  await loadComments(currentMovieId);
}

async function loadComments(movieId) {
  commentsList.innerHTML = '<p>Carregando comentários...</p>';
  try {
    const res = await fetch(`${API_URL}/comments/${movieId}`);
    const comments = await res.json();
    
    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="color:var(--text-secondary);text-align:center;">Nenhum comentário ainda. Seja o primeiro!</p>';
      return;
    }

    commentsList.innerHTML = comments.map(c => `
      <div class="comment-item">
        <p>${c.texto}</p>
        <span class="comment-date">${new Date(c.criado_em).toLocaleString('pt-BR')}</span>
      </div>
    `).join('');
  } catch (err) {
    commentsList.innerHTML = '<p>Erro ao carregar comentários.</p>';
  }
}

// Start app
init();
