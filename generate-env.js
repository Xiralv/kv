const fs = require('fs');
const path = require('path');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
}

const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY
};

function generateEnvFile(filePath, isProd) {
    const content = `
export const environment = {
  production: ${isProd},
  SUPABASE_URL: '${envVars.SUPABASE_URL}',
  SUPABASE_KEY: '${envVars.SUPABASE_KEY}'
};
`;

    fs.writeFileSync(filePath, content.trim() + '\n');
    console.log(`✅ Generated ${filePath}`);
}

generateEnvFile(path.join(__dirname, 'src/environments/environment.ts'), false);
generateEnvFile(path.join(__dirname, 'src/environments/environment.prod.ts'), true);
