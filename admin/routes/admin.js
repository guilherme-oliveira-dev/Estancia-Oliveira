const express = require('express');
const router = express.Router();
const path = require('path');

// Rota protegida de cavalos
router.get('/cavalos', (req, res) => {
  if (!req.session.logado) {
    return res.redirect('/login'); // impede acesso direto sem login
  }

  // envia o arquivo HTML estático
  res.sendFile(path.join(__dirname, '../public/cavalos.html'));
});

module.exports = router;