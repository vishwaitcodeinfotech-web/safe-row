
const fs = require('fs');
const path = require('path');

const productsJsonPath = 'd:/safe row/products.json';
const imagesDirPath = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
const filesInImages = fs.readdirSync(imagesDirPath);

const referencedImages = new Set(products.map(p => p.image ? p.image.replace('images/', '') : null));

const unreferenced = filesInImages.filter(f => !referencedImages.has(f) && f.endsWith('.png') || f.endsWith('.jpg'));

fs.writeFileSync('d:/safe row/unreferenced_images.txt', unreferenced.join('\n'));
console.log('DONE');
