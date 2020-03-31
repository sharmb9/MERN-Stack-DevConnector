const express = require("express");
const connectDb = require('./config/db')
const app = express();

// Connect DB
connectDb();

app.get("/", (req,res) => {
    res.send("API running...")
})

const PORT= process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
