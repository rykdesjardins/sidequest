const express = require('express')
const app = express()
const port = 8088; 

const options = {
    index: "playground.html"
};

app.use(express.static('testserver', options))
app.use("/build", express.static('build'));

app.listen(port);

require('opn')(`http://localhost:${port}`);
