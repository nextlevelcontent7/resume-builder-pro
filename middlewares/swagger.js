const path = require('path');
const fs = require('fs');

// Serve swagger.yaml file as JSON
module.exports = function swagger(req, res) {
  const spec = fs.readFileSync(path.join(__dirname, '..', 'docs', 'swagger.yaml'), 'utf8');
  res.type('text/yaml').send(spec);
};
