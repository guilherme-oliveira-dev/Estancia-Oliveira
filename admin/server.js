const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Serve login.html
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@estancia.com' && password === '123456') {
    // Login ok, redireciona para dashboard
    res.redirect('/dashboard');
  } else {
    // Login falhou, retorna para login com mensagem
    res.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
  }
});

// Dashboard simples
app.get('/dashboard', (req, res) => {
  res.send('<h1>Bem-vindo ao Painel Administrativo</h1><p><a href="/login">Sair</a></p>');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
