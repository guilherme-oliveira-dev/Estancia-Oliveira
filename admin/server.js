const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3001;

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessão
app.use(session({
  secret: 'senha-super-secreta',
  resave: false,
  saveUninitialized: true
}));

// Middleware para checar login
function verificarLogin(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Rotas
app.get('/', verificarLogin, (req, res) => {
  res.send('Bem-vindo à área administrativa!');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  // Simples verificação (depois substituímos por banco de dados)
  if (usuario === 'admin' && senha === '1234') {
    req.session.usuario = usuario;
    res.redirect('/');
  } else {
    res.render('login', { erro: 'Usuário ou senha inválidos!' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
