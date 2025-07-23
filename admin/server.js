const path = require('path');
const express = require('express');
const session = require('express-session'); // Importa o express-session
const app = express();

app.use(express.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
  secret: 'segredoSuperSecreto123!', // troca por algo seguro
  resave: false,
  saveUninitialized: true
}));

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para proteger rotas que precisam de login
function checkAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next(); // usuário está logado, segue
  } else {
    res.redirect('/login'); // não está logado, volta pro login
  }
}

// Página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Processa login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@estancia.com' && senha === '123456') {
    // Marca sessão como logada
    req.session.loggedIn = true;
    res.redirect('/dashboard');
  } else {
    res.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
  }
});

// Rota dashboard protegida por autenticação
app.get('/dashboard', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'public', 'dashboard.html'));
});

// Rota para logout (finaliza sessão)
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor admin rodando em http://localhost:${PORT}`);
});
console.log('__dirname:', __dirname);
console.log(path.join(__dirname, 'public', 'dashboard.html'));


