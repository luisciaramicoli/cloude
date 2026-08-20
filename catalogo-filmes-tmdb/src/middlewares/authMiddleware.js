const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { id, nome }
    next();
  } catch (ex) {
    res.clearCookie('token');
    res.status(400).json({ error: 'Token inválido.' });
  }
};

module.exports = authMiddleware;
