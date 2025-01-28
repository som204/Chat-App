const tree = {
    myproject: {
        directory: {
            'package.json': {
                file: {
                    contents: {
                        "name": "my-express-app",
                        "version": "1.0.0",
                        "description": "A basic Express app.",
                        "main": "server.js",
                        "scripts": {
                            "start": "node server.js",
                            "dev": "nodemon server.js"
                        },
                        "dependencies": {
                            "express": "^4.18.2",
                            "dotenv": "^16.3.1"
                        },
                        "devDependencies": {
                            "nodemon": "^3.0.1"
                                }
                            }
                        }
                    },
            '.gitignore': {
                file: {
                    contents: "node_modules\n.env"
                }
            },
            'server.js': {
                file: {
                    contents: "const express = require('express');\nconst dotenv = require('dotenv');\ndotenv.config();\n\nconst app = express();\nconst port = process.env.PORT || 3000;\n\n// Middleware to parse JSON\napp.use(express.json());\n\n// Import routes\nconst routes = require('./routes');\napp.use('/', routes);\n\n// Error handling middleware\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).send('Something broke!');\n});\n\n// Start the server\napp.listen(port, () => {\n  console.log(`Server is running on http://localhost:${port}`);\n});"
                }
            },
            'routes.js': {
                file: {
                    contents: "const express = require('express');\nconst router = express.Router();\n\n// Default route\nrouter.get('/', (req, res) => {\n  res.send('Hello from Express!');\n});\n\n// Additional route for demonstration\nrouter.get('/about', (req, res) => {\n  res.send('This is the About page!');\n});\n\nmodule.exports = router;"
                }
            },
            '.env': {
                file: {
                    contents: "PORT=3000"
                }
            }
        }
    }
}