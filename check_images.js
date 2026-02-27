
const fs = require('fs');
const path = require('path');

const productsJsonPath = 'd:/safe row/products.json';
const imagesDirPath = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
const filesInImages = fs.readdirSync(imagesDirPath);

console.log('START_CHECK');
products.forEach(p => {
    if (p.image) {
        const imageName = p.image.replace('images/', '');
        const fullPath = path.join(imagesDirPath, imageName);
        const exists = fs.existsSync(fullPath);
        if (!exists) {
            console.log('MISSING:' + imageName + '|' + p.title);
            const closeMatch = filesInImages.find(f => f.toLowerCase().includes(imageName.split('.')[0].toLowerCase().split('(')[0].trim()));
            if (closeMatch) {
                console.log('MATCH:' + closeMatch);
            }
        }
    }
});
console.log('END_CHECK');
