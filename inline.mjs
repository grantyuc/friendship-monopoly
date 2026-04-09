import { readFileSync, writeFileSync, existsSync } from 'fs';

const html = readFileSync('dist/index.html', 'utf-8');
const js   = readFileSync('dist/assets/index.js', 'utf-8');
const css  = existsSync('dist/assets/index.css')
  ? readFileSync('dist/assets/index.css', 'utf-8')
  : null;

// Escape </script> to prevent HTML parser from closing the tag early.
// Use a replacer FUNCTION (not a string) so that $& $' $` in the JS
// are NOT interpreted as special replacement patterns.
const safeJs  = js.replace(/<\/script>/gi, '<\\/script>');
const safeCss = css ? css.replace(/<\/style>/gi, '<\\/style>') : null;

// Remove the original script tag from <head>
let result = html
  .replace(
    /<script[^>]*src="[^"]*assets\/index\.js"[^>]*><\/script>/,
    () => ''
  );

// Insert inlined CSS into <head> if present
if (safeCss) {
  result = result
    .replace(
      /<link[^>]*href="[^"]*assets\/index\.css"[^>]*>/,
      () => `<style>${safeCss}</style>`
    );
}

// Place inlined JS AFTER <div id="root"> so the DOM element exists when it runs
result = result.replace(
  /(<div id="root"><\/div>)/,
  () => `<div id="root"></div>\n    <script>${safeJs}</script>`
);

writeFileSync('dist/index.html', result);
console.log('✓ Inlined JS/CSS into dist/index.html');
