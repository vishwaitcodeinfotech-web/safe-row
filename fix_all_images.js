
const fs = require('fs');
const path = require('path');

const jsonPath = 'd:/safe row/products.json';
const imagesDir = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const files = fs.readdirSync(imagesDir);

console.log('Starting Thorough Image Check...');

products.forEach((p, idx) => {
    if (!p.image) return;
    const currentPath = p.image;
    const fileName = currentPath.replace('images/', '');
    const fullPath = path.join(imagesDir, fileName);

    if (!fs.existsSync(fullPath)) {
        console.log(`[${idx}] MISSING: "${fileName}" (Product: "${p.title}")`);

        // Try to find a match
        const base = fileName.toLowerCase().split('.')[0].trim();
        // Look for any file that contains the base name or vice-versa
        const match = files.find(f => {
            const fLower = f.toLowerCase();
            const fBase = fLower.split('.')[0].trim();
            return fBase === base || fBase.includes(base) || base.includes(fBase);
        });

        if (match) {
            console.log(`      -> PROPOSED FIX: "images/${match}"`);
            p.image = 'images/' + match;
        } else {
            console.log(`      !! NO MATCH FOUND !!`);
        }
    }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 4));
console.log('Saved updated products.json');

// Now do the same for product-data.js FALLBACK_PRODUCTS if possible
let jsContent = fs.readFileSync('d:/safe row/product-data.js', 'utf8');
const startTag = 'const FALLBACK_PRODUCTS = [';
const endTag = '];';
const startIndex = jsContent.indexOf(startTag);
const endIndex = jsContent.indexOf(endTag, startIndex) + 2;

if (startIndex !== -1 && endIndex !== -1) {
    let fallbackStr = jsContent.substring(startIndex + startTag.length - 1, endIndex);
    try {
        let fallback = eval(fallbackStr);
        fallback.forEach(p => {
            if (!p.image) return;
            const fileName = p.image.replace('images/', '');
            if (!fs.existsSync(path.join(imagesDir, fileName))) {
                const base = fileName.toLowerCase().split('.')[0].trim();
                const match = files.find(f => f.toLowerCase().includes(base));
                if (match) p.image = 'images/' + match;
            }
        });
        const newFallbackStr = JSON.stringify(fallback, null, 4);
        jsContent = jsContent.substring(0, startIndex + startTag.length - 1) + newFallbackStr + jsContent.substring(endIndex);
        fs.writeFileSync('d:/safe row/product-data.js', jsContent);
        console.log('Saved updated product-data.js');
    } catch (e) {
        console.log('Failed to parse FALLBACK_PRODUCTS', e);
    }
}
