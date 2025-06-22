const path = require('path');
const fs = require('fs');

// Serve the OpenAPI specification. Location can be overridden via SWAGGER_PATH.
module.exports = function swagger(req, res) {
  const specPath = process.env.SWAGGER_PATH || path.join(__dirname, '..', 'docs', 'swagger.yaml');
  const spec = fs.readFileSync(specPath, 'utf8');
  res.type('text/yaml').send(spec);
};
