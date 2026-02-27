
const fs = require('fs');
const path = require('path');

const productsJsonPath = 'd:/safe row/products.json';
const imagesDirPath = 'd:/safe row/images';

const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
const filesInImages = fs.readdirSync(imagesDirPath); // Readdir is case-sensitive or at least returns the actual case

console.log('--- CASE SENSITIVITY CHECK ---');
let issues = 0;
products.forEach(p => {
    if (p.image) {
        const expectedName = p.image.replace('images/', '');
        // Find if any file matches case-insensitively but NOT case-sensitively
        const caseInsensitiveMatch = filesInImages.find(f => f.toLowerCase() === expectedName.toLowerCase());

        if (caseInsensitiveMatch) {
            if (caseInsensitiveMatch !== expectedName) {
                console.log(`CASE MISMATCH:`);
                console.log(`  Expected (JSON): "${expectedName}"`);
                console.log(`  Actual (Disk):   "${caseInsensitiveMatch}"`);
                console.log(`  Product:         "${p.title}"`);
                issues++;
            }
        } else {
            console.log(`MISSING ENTIRELY: "${expectedName}" for "${p.title}"`);
            issues++;
        }
    }
});

if (issues === 0) {
    console.log('All image paths match exactly (case-sensitive).');
} else {
    console.log(`\nFound ${issues} issues.`);
}
