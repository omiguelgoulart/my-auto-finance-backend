import express from 'express';

import loginRoutes from './routes/login';
import usuarioRoutes from './routes/usuario';
import bancoRoutes from './routes/banco';


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



const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});