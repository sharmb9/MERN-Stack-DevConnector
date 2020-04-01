const express = require("express");
const connectDb = require('./config/db')
const app = express();

// Connect DB
connectDb();

// Init middleware
app.use(express.json({extended:false}));

app.get("/", (req,res) => {
    res.send("API running...")
})

// Define routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/users", require("./routes/api/users"));

const PORT= process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
