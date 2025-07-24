const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db'); // importa conexão


app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(session({
  secret: 'segredoSuperSecreto123!',
  resave: false,
  saveUninitialized: true
}));

// Arquivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
function checkAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

// ======== ROTAS ========

// Página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@estancia.com' && senha === '123456') {
    req.session.loggedIn = true;
    res.redirect('/dashboard');
  } else {
    res.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
  }
});

// Dashboard (painel admin)
app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ➕ NOVO: rota protegida para página de cavalos
app.get('/cavalos', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cavalos.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor admin rodando em http://localhost:${PORT}`);
});
// Formulário de novo cavalo
app.get('/cavalos/novo', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cavalos-novo.html'));
});

// Rota POST para salvar no banco
app.post('/cavalos/criar', checkAuth, (req, res) => {
  const { nome, pelagem, idade, linhagem } = req.body;

  const sql = 'INSERT INTO cavalos (nome, pelagem, idade, linhagem) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, pelagem, idade, linhagem], (err, result) => {
    if (err) {
      console.error('Erro ao inserir cavalo:', err);
      return res.send('Erro ao salvar cavalo');
    }

    console.log('Cavalo cadastrado com ID:', result.insertId);
    res.redirect('/cavalos');
  });
});