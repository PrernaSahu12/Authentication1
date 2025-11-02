const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app")


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is ruuning on port ${PORT}`);
});