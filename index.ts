import express from 'express';

import loginRoutes from './routes/login';
import usuarioRoutes from './routes/usuario';
import bancoRoutes from './routes/banco';
import contaRoutes from './routes/conta';
import categoriaRoutes from './routes/categoria';
import movimentacaoRoutes from './routes/movimentacao';
import regraCategoriaRoutes from './routes/regraCategoria';


import cors from 'cors';


const app = express();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'API myAutoFinance!' });
});


app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/banco', bancoRoutes);
app.use('/conta', contaRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/movimentacao', movimentacaoRoutes);
app.use('/regra-categoria', regraCategoriaRoutes);



const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});