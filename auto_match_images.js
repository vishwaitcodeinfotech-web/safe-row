
const fs = require('fs');
const path = require('path');

const jsonPath = 'd:/safe row/products.json';
const imagesDir = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const files = fs.readdirSync(imagesDir);

console.log('--- AUTO-MATCHER ---');
const fixes = [];

products.forEach(p => {
    if (!p.image) return;
    const currentName = p.image.replace('images/', '');
    if (!fs.existsSync(path.join(imagesDir, currentName))) {
        // Try matching
        const base = currentName.toLowerCase().split('.')[0].trim();
        const match = files.find(f => {
            const fBase = f.toLowerCase().split('.')[0].trim();
            return fBase === base || fBase.startsWith(base) || base.startsWith(fBase);
        });

        if (match) {
            console.log(`MATCH FOUND for "${currentName}": "${match}"`);
            fixes.push({ from: p.image, to: 'images/' + match });
        } else {
            console.log(`NO MATCH for "${currentName}"`);
        }
    }
});

fs.writeFileSync('d:/safe row/potential_fixes.json', JSON.stringify(fixes, null, 2));
console.log('Wrote potential fixes to potential_fixes.json');
