const axios = require('axios');
(async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3005/api', withCredentials: true });
    
    // Register
    try {
      await api.post('/auth/register', { nome: 'Test', email: 'test@test.com', senha: 'password' });
    } catch(e) {}
    
    // Login
    const resLogin = await api.post('/auth/login', { email: 'test@test.com', senha: 'password' });
    const cookie = resLogin.headers['set-cookie'][0];
    
    // Fetch Favs
    const resFavs = await api.get('/favorites', { headers: { Cookie: cookie } });
    console.log('Favorites:', resFavs.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
})();
