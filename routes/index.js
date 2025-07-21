const express = require('express');
const router = express.Router();
const path = require('path');

// Página inicial
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Página de cadastro de interesse
router.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'cadastrointeresse.html'));
});

// Página de pedigree
router.get('/pedigree', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pedigree.html'));
});

module.exports = router;
