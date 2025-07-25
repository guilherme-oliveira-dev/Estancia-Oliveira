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

// ✅ nova rota /cavalos com listagem do banco
app.get('/cavalos', checkAuth, (req, res) => {
  const sql = 'SELECT * FROM cavalos';

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar cavalos:', err);
      return res.send('Erro ao carregar cavalos');
    }

    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Gerenciar Cavalos</title>
      </head>
      <body>
        <h1>Lista de Cavalos</h1>
        <a href="/dashboard">⬅ Voltar ao Painel</a> |
        <a href="/cavalos/novo">➕ Adicionar Novo Cavalo</a>
        <br><br>
        <table border="1" cellpadding="8">
          <thead>
            <tr>
              <th>Registro</th>
              <th>Nome</th>
              <th>Pelagem</th>
              <th>Idade</th>
              <th>Linhagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

    resultados.forEach((cavalo) => {
      html += `
        <tr>
          <td>${cavalo.registro}</td>
          <td>${cavalo.nome}</td>
          <td>${cavalo.pelagem}</td>
          <td>${cavalo.idade}</td>
          <td>${cavalo.linhagem}</td>
          <td><a href="/cavalos/excluir/${cavalo.registro}" onclick="return confirm('Tem certeza que deseja excluir?')">🗑️ Excluir</a></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    res.send(html);
  });
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
  const { registro, nome, pelagem, idade, linhagem } = req.body;

  const sql = 'INSERT INTO cavalos (registro, nome, pelagem, idade, linhagem) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [registro, nome, pelagem, idade, linhagem], (err) => {
    if (err) {
      console.error('Erro ao inserir cavalo:', err);
      return res.send('Erro ao salvar cavalo (registro pode estar duplicado)');
    }

    console.log('Cavalo cadastrado com registro:', registro);
    res.redirect('/cavalos');
  });
});
app.get('/cavalos/excluir/:registro', checkAuth, (req, res) => {
  const { registro } = req.params;

  const sql = 'DELETE FROM cavalos WHERE registro = ?';
  db.query(sql, [registro], (err) => {
    if (err) {
      console.error('Erro ao excluir cavalo:', err);
      return res.send('Erro ao excluir cavalo');
    }

    console.log(`Cavalo com registro ${registro} excluído.`);
    res.redirect('/cavalos');
  });
});