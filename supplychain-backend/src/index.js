require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/product.route');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/products', productRoutes);

app.get('/health', (req, res)=> res.json({ok:true}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend running on', PORT));
