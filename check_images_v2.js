
const fs = require('fs');
const path = require('path');

const productsJsonPath = 'd:/safe row/products.json';
const imagesDirPath = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
const filesInImages = fs.readdirSync(imagesDirPath);

const results = [];
products.forEach(p => {
    if (p.image) {
        const imageName = p.image.replace('images/', '');
        const exists = fs.existsSync(path.join(imagesDirPath, imageName));
        if (!exists) {
            results.push(`MISSING: ${imageName} | ${p.title}`);
        }
    }
});

fs.writeFileSync('d:/safe row/missing_report.txt', results.join('\n'));
console.log('DONE');
