const fs = require('fs')
const code = fs.readFileSync('js/admin.js', 'utf8')
try {
  new Function(code)
  console.log('Script is syntactically valid')
} catch (e) {
  console.log('Syntax Error:', e.message)
}
