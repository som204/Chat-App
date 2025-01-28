```json
{
  "message": "Here's your Express app with a proper file structure and code. Follow the instructions to set it up and run it.",
  "fileTree": {
    "package.json": {
      "file":{
      "content": {"
        \"name\": \"my-express-app\",
        \"version\": \"1.0.0\",
        \"description\": \"A basic Express app.\",
        \"main\": \"src/server.js\",
        \"scripts\": {
          \"start\": \"node src/server.js\",
          \"dev\": \"nodemon src/server.js\"
        },
        \"dependencies\": {
          \"express\": \"^4.18.2\"
        },
        \"devDependencies\": {
          \"nodemon\": \"^3.0.1\"
            }
        }"}},
    ".gitignore": {
      "file":{
      "content": "node_modules\n.env"
}},
      "server.js": {
        "file":{
        "content": "const express = require('express');\nconst dotenv = require('dotenv');\ndotenv.config();\n\nconst app = express();\nconst port = process.env.PORT || 3000;\n\n// Middleware to parse JSON\napp.use(express.json());\n\n// Import routes\nconst routes = require('./routes');\napp.use('/', routes);\n\n// Error handling middleware\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).send('Something broke!');\n});\n\n// Start the server\napp.listen(port, () => {\n  console.log(`Server is running on http://localhost:${port}`);\n});"
}},
      "routes.js": {
        "file":{
        "content": "const express = require('express');\nconst router = express.Router();\n\n// Default route\nrouter.get('/', (req, res) => {\n  res.send('Hello from Express!');\n});\n\n// Additional route for demonstration\nrouter.get('/about', (req, res) => {\n  res.send('This is the About page!');\n});\n\nmodule.exports = router;"
}},
    ".env": {
      "file":{
      "content": "PORT=3000"
}}
},
  "buildCommands": [
    "npm install"
  ],
  "runCommands": [
    "npm start"
  ]
}
```