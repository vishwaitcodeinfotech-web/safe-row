
const fs = require('fs');
const path = require('path');

const filePath = 'd:/safe row/product-data.js';
const imagesDirPath = 'd:/safe row/images';

const content = fs.readFileSync(filePath, 'utf8');
const start = content.indexOf('const FALLBACK_PRODUCTS =');
const end = content.indexOf('];', start) + 2;
const fallback = eval(content.substring(start, end).replace('const FALLBACK_PRODUCTS =', ''));

const results = [];
fallback.forEach(p => {
    if (p.image) {
        const imageName = p.image.replace('images/', '');
        const exists = fs.existsSync(path.join(imagesDirPath, imageName));
        if (!exists) {
            results.push(`MISSING: ${imageName} | ${p.title}`);
        }
    }
});

fs.writeFileSync('d:/safe row/missing_report_fallback.txt', results.join('\n'));
console.log('DONE');
