const serverless = require('@serverless-devs/fc-http');
const express = require('express')
const app = express()
const fs = require('fs')


app.get('/:filepath', (req, res) => {
  console.log(`GET /file/${req.params.filepath}`)

  const filepath = req.params.filepath;
  if (!fs.existsSync(filepath)) {
    return res.status(400).send(`file: '${filepath}' not found!`);
  }

  const blob = fs.readFileSync(filepath)
  res.writeHead(200, {
    'content-type': 'application/octet-stream',
    'content-disposition': `attachment; filename=${filepath}`,
  });
  res.end(blob);
})

exports.handler = serverless(app);
