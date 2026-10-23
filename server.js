const express = require('express');
const { simular } = require('./calculos');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/simular', (req, res) => {
  const aparelhos = req.body.aparelhos;

  if (!Array.isArray(aparelhos) || aparelhos.length === 0) {
    return res.status(400).json({ erro: 'A lista de aparelhos não pode estar vazia.' });
  }

  for (let i = 0; i < aparelhos.length; i++) {
    const a = aparelhos[i];
    const num = i + 1;

    if (typeof a.nome !== 'string' || a.nome.trim() === '') {
      return res.status(400).json({ erro: `nome deve ser um texto válido (aparelho ${num})` });
    }
    if (typeof a.potenciaW !== 'number' || a.potenciaW < 1 || a.potenciaW > 10000) {
      return res.status(400).json({ erro: `potenciaW deve estar entre 1 e 10000 (aparelho ${num})` });
    }
    if (typeof a.horasDia !== 'number' || a.horasDia < 0 || a.horasDia > 24) {
      return res.status(400).json({ erro: `horasDia deve estar entre 0 e 24 (aparelho ${num})` });
    }
    if (typeof a.diasMes !== 'number' || !Number.isInteger(a.diasMes) || a.diasMes < 1 || a.diasMes > 31) {
      return res.status(400).json({ erro: `diasMes deve ser um inteiro entre 1 e 31 (aparelho ${num})` });
    }
  }

  res.json(simular(aparelhos));
});

app.listen(3000, () => console.log('Medidor Coopera em http://localhost:3000'));