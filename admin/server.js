const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db'); // importa conexão
const multer = require('multer');
const fs = require('fs');





// Configuração do destino e nome do arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const nomeUnico = Date.now() + '-' + file.originalname;
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



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
      <td>
        ${cavalo.foto ? `<img src="/uploads/${cavalo.foto}" width="100">` : 'Sem foto'}
      </td>
      <td>
        <a href="/cavalos/editar/${cavalo.registro}">✏️ Editar</a> |
        <a href="/cavalos/excluir/${cavalo.registro}" onclick="return confirm('Tem certeza que deseja excluir?')">🗑️ Excluir</a>
      </td>
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
app.post('/cavalos/criar', checkAuth, upload.single('foto'), (req, res) => {
  const { registro, nome, pelagem, idade, linhagem } = req.body;
  const foto = req.file ? req.file.filename : null;

  const sql = 'INSERT INTO cavalos (registro, nome, pelagem, idade, linhagem, foto) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [registro, nome, pelagem, idade, linhagem, foto], (err) => {
    if (err) {
      console.error('Erro ao inserir cavalo:', err);
      return res.send('Erro ao salvar cavalo');
    }

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

app.get('/cavalos/editar/:registro', checkAuth, (req, res) => {
  const { registro } = req.params;

  const sql = 'SELECT * FROM cavalos WHERE registro = ?';
  db.query(sql, [registro], (err, results) => {
    if (err || results.length === 0) {
      return res.send('Cavalo não encontrado');
    }

    const cavalo = results[0];

    const form = `
      <html>
      <head><meta charset="UTF-8"><title>Editar Cavalo</title></head>
      <body>
        <h1>Editar Cavalo</h1>
        <form action="/cavalos/atualizar/${registro}" method="post" enctype="multipart/form-data">
          <label>Nome: <input type="text" name="nome" value="${cavalo.nome}" required></label><br>
          <label>Pelagem: <input type="text" name="pelagem" value="${cavalo.pelagem}"></label><br>
          <label>Idade: <input type="number" name="idade" value="${cavalo.idade}"></label><br>
          <label>Linhagem: <input type="text" name="linhagem" value="${cavalo.linhagem}"></label><br>
          <p>Foto atual:</p>
          ${cavalo.foto ? `<img src="/uploads/${cavalo.foto}" width="150"><br>` : 'Sem foto'}
          <label>Nova Foto (opcional): <input type="file" name="foto"></label><br><br>
          <button type="submit">Salvar Alterações</button>
        </form>
        <a href="/cavalos">⬅ Voltar</a>
      </body>
      </html>
    `;

    res.send(form);
  });
});

app.post('/cavalos/atualizar/:registro', checkAuth, upload.single('foto'), (req, res) => {
  const { registro } = req.params;
  const { nome, pelagem, idade, linhagem } = req.body;
  const novaFoto = req.file ? req.file.filename : null;

  // Buscar cavalo atual para ver se tem foto
  const sqlBusca = 'SELECT foto FROM cavalos WHERE registro = ?';
  db.query(sqlBusca, [registro], (err, results) => {
    if (err || results.length === 0) {
      return res.send('Erro ao buscar cavalo para atualizar.');
    }

    const fotoAntiga = results[0].foto;

    // Atualiza os dados no banco
    const sqlAtualiza = `
      UPDATE cavalos 
      SET nome = ?, pelagem = ?, idade = ?, linhagem = ?, foto = ?
      WHERE registro = ?
    `;
    const novaFotoOuAtual = novaFoto || fotoAntiga;

    db.query(sqlAtualiza, [nome, pelagem, idade, linhagem, novaFotoOuAtual, registro], (err) => {
      if (err) {
        console.error('Erro ao atualizar:', err);
        return res.send('Erro ao atualizar cavalo.');
      }

      // Se enviou nova imagem e havia uma antiga → deletar antiga
      if (novaFoto && fotoAntiga) {
        const caminho = path.join(__dirname, 'uploads', fotoAntiga);
        fs.unlink(caminho, (err) => {
          if (err) console.warn('Erro ao excluir foto antiga:', err.message);
        });
      }

      res.redirect('/cavalos');
    });
  });
});

app.get('/pedigrees/novo', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pedigrees-novo.html'));
});


app.post('/pedigrees/criar', checkAuth, (req, res) => {
  const {
    cavalo_nome,
    pai_nome,
    mae_nome,
    avo_paterno_nome,
    avo_paterna_nome,
    avo_materno_nome,
    avo_materna_nome
  } = req.body;

  const sql = `
    INSERT INTO pedigrees (
      cavalo_nome, pai_nome, mae_nome,
      avo_paterno_nome, avo_paterna_nome,
      avo_materno_nome, avo_materna_nome
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cavalo_nome, pai_nome, mae_nome,
    avo_paterno_nome, avo_paterna_nome,
    avo_materno_nome, avo_materna_nome
  ], (err) => {
    if (err) {
      console.error('Erro ao cadastrar pedigree:', err);
      return res.send('Erro ao salvar pedigree');
    }

    res.redirect('/pedigrees');
  });
});


app.get('/pedigrees', checkAuth, (req, res) => {
  const sql = 'SELECT * FROM pedigrees';

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar pedigrees:', err);
      return res.send('Erro ao carregar lista de pedigrees');
    }

    let html = `
      <html>
      <head><meta charset="UTF-8"><title>Pedigrees</title></head>
      <body>
        <h1>Lista de Pedigrees</h1>
        <a href="/dashboard">⬅ Voltar</a> | <a href="/pedigrees/novo">➕ Novo Pedigree</a>
        <table border="1" cellpadding="8">
          <thead>
            <tr>
              <th>Cavalo</th>
              <th>Pai</th>
              <th>Mãe</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
    `;

    resultados.forEach(ped => {
      html += `
        <tr>
          <td>${ped.cavalo_nome}</td>
          <td>${ped.pai_nome || '-'}</td>
          <td>${ped.mae_nome || '-'}</td>
          <td>
            <a href="/pedigrees/visualizar/${ped.id}">👁️ Ver</a>
            | <a href="/pedigrees/excluir/${ped.id}" onclick="return confirm('Excluir pedigree?')">🗑️ Excluir</a>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></body></html>`;
    res.send(html);
  });
});

