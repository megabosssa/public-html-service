const fs = require('fs');

const path = 'c:\\Users\\usEr\\Documents\\api\\public-html-service\\tools\\learning\\english-lab.html';
let content = fs.readFileSync(path, 'utf8');

// Simple distribution of CEFR levels for variation
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
let c = 0;

content = content.replace(/\{ word: "([^"]+)", phonetic: "([^"]*)", type: "([^"]+)", def: "([^"]+)", example: "([^"]+)" \}/g, (match, word, phonetic, type, def, example) => {
    // Assign CEFR level. A simple rotation or hash to give variation.
    const lvl = levels[c % levels.length];
    c++;
    return `{ word: "${word}", phonetic: "${phonetic}", type: "${type}", def: "${def}", example: "${example}", cefr: "${lvl}" }`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('VOCAB updated with CEFR levels.');
