const express =require('express')
const app = express();

app.use('/', require('./routes/index.js'))

app.listen(3000,() => {
    console.log('サーバーを起動しました')
})