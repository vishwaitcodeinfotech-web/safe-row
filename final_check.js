
const fs = require('fs');
const path = require('path');
const json = JSON.parse(fs.readFileSync('d:/safe row/products.json', 'utf8'));
const imagesDir = 'd:/safe row/images';
console.log(`Checking ${json.length} products...`);
let missing = 0;
json.forEach(p => {
    if (!p.image) {
        console.log(`NO IMAGE DEFINED for ${p.title}`);
        missing++;
        return;
    }
    const name = p.image.replace('images/', '');
    if (!fs.existsSync(path.join(imagesDir, name))) {
        console.log(`MISSING: ${name} (${p.title})`);
        missing++;
    }
});
console.log(`Check complete. Found ${missing} missing images.`);
