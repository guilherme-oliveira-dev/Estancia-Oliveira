const path = require('path');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para exibir a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para processar o login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (email === 'admin@estancia.com' && senha === '123456') {
    res.redirect('/dashboard');
  } else {
    res.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
  }
});

// Rota da dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Inicia o servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor admin rodando em http://localhost:${PORT}`);
});
