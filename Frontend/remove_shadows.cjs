const fs = require('fs');
const path = 'src/student/StudentProfile.jsx';
let code = fs.readFileSync(path, 'utf-8');

// Replace shadow classes globally
const shadowClasses = [
    'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-inner', 'shadow',
    'shadow-purple-200/40', 'drop-shadow-sm', 'hover:shadow-md'
];

shadowClasses.forEach(cls => {
    // using regex boundary might fail for classes with dashes/slashes, 
    // so we can use a simpler approach or specific regex
    // split by space/quotes and remove
    // Actually regex with negative lookahead/behind is safer
    const regex = new RegExp(`\\b${cls}\\b`, 'g');
    code = code.replace(regex, '');
});

// clean up double spaces and empty classNames
code = code.replace(/  +/g, ' ');
code = code.replace(/className="\s+"/g, 'className=""');
code = code.replace(/className=\`\s+/g, 'className=\`');

fs.writeFileSync(path, code);
console.log("Shadows removed!");
