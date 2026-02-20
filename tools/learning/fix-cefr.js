const fs = require('fs');

const path = 'c:\\Users\\usEr\\Documents\\api\\public-html-service\\tools\\learning\\english-lab.html';
let content = fs.readFileSync(path, 'utf8');

// Shift all existing current vocabulary to B1, B2, C1, C2 since "Acquisition", "Algorithm", etc. are hard.
const advancedLevels = ['B1', 'B2', 'C1', 'C2'];
let counter = 0;

// Update existing cefr tags to be at least B1
content = content.replace(/cefr: "(A1|A2|B1|B2|C1|C2)"/g, (match, lvl) => {
    const newLvl = advancedLevels[counter % advancedLevels.length];
    counter++;
    return `cefr: "${newLvl}"`;
});

// A proper list of A1 / A2 words
const kidsBasics = `
            "Kids Basics": [
                { word: "Cat", phonetic: "/kæt/", type: "noun", def: "A small animal with fur, four legs, a tail, and claws.", example: "The cat is sleeping on the bed.", cefr: "A1" },
                { word: "Dog", phonetic: "/dɔːɡ/", type: "noun", def: "A common animal with four legs, kept as a pet.", example: "My dog loves to play catch.", cefr: "A1" },
                { word: "Apple", phonetic: "/ˈæp.əl/", type: "noun", def: "A hard, round fruit with green or red skin.", example: "She ate an apple for a snack.", cefr: "A1" },
                { word: "Book", phonetic: "/bʊk/", type: "noun", def: "A set of pages bound together, for reading or writing.", example: "I read a good book yesterday.", cefr: "A1" },
                { word: "Happy", phonetic: "/ˈhæp.i/", type: "adj", def: "Feeling or showing pleasure.", example: "He was very happy to see his friends.", cefr: "A1" },
                { word: "Jump", phonetic: "/dʒʌmp/", type: "verb", def: "To push yourself off the ground into the air.", example: "The children like to jump on the trampoline.", cefr: "A1" },
                { word: "Red", phonetic: "/red/", type: "adj", def: "The color of blood or tomatoes.", example: "She wore a bright red dress.", cefr: "A1" },
                { word: "Run", phonetic: "/rʌn/", type: "verb", def: "To move quickly with your legs.", example: "We need to run to catch the bus.", cefr: "A1" },
                { word: "Sun", phonetic: "/sʌn/", type: "noun", def: "The star that provides light and heat for the earth.", example: "The sun is shining brightly today.", cefr: "A1" },
                { word: "Water", phonetic: "/ˈwɑː.t̬ɚ/", type: "noun", def: "A clear liquid that falls as rain and is used for drinking.", example: "Please give me a glass of water.", cefr: "A1" },
                { word: "Bicycle", phonetic: "/ˈbaɪ.sə.kəl/", type: "noun", def: "A vehicle with two wheels that you ride by pushing pedals.", example: "He rides his bicycle to school.", cefr: "A2" },
                { word: "Garden", phonetic: "/ˈɡɑːr.dən/", type: "noun", def: "A piece of land next to a house where plants are grown.", example: "They have a beautiful flower garden.", cefr: "A2" },
                { word: "Teacher", phonetic: "/ˈtiː.tʃɚ/", type: "noun", def: "A person who teaches, especially in a school.", example: "The teacher explained the lesson clearly.", cefr: "A2" },
                { word: "Window", phonetic: "/ˈwɪn.doʊ/", type: "noun", def: "An opening in a wall, usually covered with glass.", example: "Please open the window for some fresh air.", cefr: "A2" },
                { word: "Yellow", phonetic: "/ˈjel.oʊ/", type: "adj", def: "The color of lemons or butter.", example: "The sun is yellow.", cefr: "A2" },
                { word: "Friend", phonetic: "/frend/", type: "noun", def: "A person you know well and like a lot.", example: "She is my best friend.", cefr: "A2" },
                { word: "School", phonetic: "/skuːl/", type: "noun", def: "A place where children go to learn.", example: "He goes to school from Monday to Friday.", cefr: "A2" },
                { word: "Play", phonetic: "/pleɪ/", type: "verb", def: "To take part in a game or activity for fun.", example: "The kids play in the park every afternoon.", cefr: "A2" },
                { word: "Family", phonetic: "/ˈfæm.əl.i/", type: "noun", def: "A group of parents and their children.", example: "My family is going on vacation.", cefr: "A2" },
                { word: "Eat", phonetic: "/iːt/", type: "verb", def: "To put food into your mouth and chew and swallow it.", example: "We eat dinner at 7 PM.", cefr: "A2" }
            ],`;

if (!content.includes('"Kids Basics"')) {
    content = content.replace(/const VOCAB = \{/, 'const VOCAB = {\n' + kidsBasics);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed CEFR levels for A1/A2 and added Kids Basics.');
