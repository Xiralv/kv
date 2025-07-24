const fs = require('fs');
const path = require('path');
require('dotenv').config();

const environmentsDir = path.join(__dirname, 'src/environments');

// Create the environments folder if it doesn't exist
if (!fs.existsSync(environmentsDir)) {
    fs.mkdirSync(environmentsDir, { recursive: true });
}

const envContent = (isProd) => `
export const environment = {
  production: ${isProd},
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_KEY: '${process.env.SUPABASE_KEY}'
};
`;

fs.writeFileSync(path.join(environmentsDir, 'environment.ts'), envContent(false));
fs.writeFileSync(path.join(environmentsDir, 'environment.prod.ts'), envContent(true));

console.log('✅ Environment files generated.');
