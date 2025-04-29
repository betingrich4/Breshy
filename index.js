const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/code', require('./pair'));
app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'pair.html')));
app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'views/success.html')));
app.get('/', (req, res) => res.redirect('/pair'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
