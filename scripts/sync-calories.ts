import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, init } from '../server/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'src', 'data.ts');

const CALORIE_MAP: Record<string, number> = {
  'kebap-adana': 680,
  'kebap-urfa': 660,
  'kebap-beyti': 850,
  'kebap-patlican': 620,
  'kebap-copsis': 580,
  'kebap-kuzusis': 640,
  'kebap-cigersis': 520,
  'kebap-tavuksis': 480,
  'kebap-kanat': 550,
  'kebap-alinazik-kuzu': 780,
  'kebap-alinazik-dana': 760,
  'kebap-mantarli-sis': 590,
  'kebap-domatesli': 540,
  'kebap-izgara-kofte': 610,
  'kebap-yogurtlu': 790,
  'kebap-tavuk-pirzola': 580,
  'doner-iskender': 750,
  'doner-simsek-iskender': 920,
  'doner-kebap': 680,
  'doner-durum': 540,
  'doner-durum-beyti': 780,
  'doner-durum-beyti-kasar': 840,
  'doner-durum-ssk': 720,
  'pide-kiymali': 680,
  'pide-kasarli': 710,
  'pide-kusbasili': 730,
  'pide-karisik': 820,
  'pide-kasarli-sucuklu': 850,
  'pide-kiyma-kasarli': 790,
  'pide-kusbasi-kasarli': 810,
  'pide-tavuklu': 620,
  'pide-mantarli': 590,
  'pide-kapali-donerli': 780,
  'kiremit-sis': 690,
  'kiremit-kofte': 720,
  'kiremit-tavuk': 590,
  'kiremit-mantarli-kofte': 760,
  'icecek-kola': 138,
  'icecek-kola-zero': 0,
  'icecek-fanta': 150,
  'icecek-sprite': 142,
  'icecek-uzay-kola': 130,
  'icecek-uzay-gazoz': 125,
  'icecek-uzay-portakal': 135,
  'icecek-ayran': 76,
  'icecek-fusetea': 95,
  'icecek-cappy': 148,
  'icecek-su': 0,
  'icecek-sira': 95,
  'icecek-salgam': 10,
  'icecek-salgam-acili': 10,
  'icecek-limonata': 120,
  'icecek-soda': 0,
  'icecek-soda-meyveli': 60
};

async function run() {
  // 1. Update src/data.ts file
  let content = fs.readFileSync(DATA_PATH, 'utf-8');
  
  for (const [id, calories] of Object.entries(CALORIE_MAP)) {
    // Check if this object already has a calories field
    // We search within a limited range of the object to avoid matching the next object
    const objectMatch = content.match(new RegExp(`id:\\s*'${id}'[\\s\\S]*?}(?:\\s*,|\\s*])`, 'g'));
    const objectStr = objectMatch ? objectMatch[0] : '';
    const hasCalories = objectStr.includes('calories:');
    
    if (!hasCalories) {
      // Add calories property right after id line
      const singleIdRegex = new RegExp(`(id:\\s*'${id}',)`, 'g');
      content = content.replace(singleIdRegex, `$1\n    calories: ${calories},`);
    } else {
      // Update existing calories property inside this object
      const caloriesRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?calories:\\s*)\\d+`, 'g');
      content = content.replace(caloriesRegex, `$1${calories}`);
    }
  }
  
  fs.writeFileSync(DATA_PATH, content, 'utf-8');
  console.log('src/data.ts successfully updated with calories!');

  // 2. Update Live database
  await init();
  
  for (const [id, calories] of Object.entries(CALORIE_MAP)) {
    await db.execute({
      sql: 'UPDATE menu_items SET calories = ? WHERE id = ?',
      args: [calories, id]
    });
  }
  
  console.log('Live database successfully updated with calories!');
}

run().catch(console.error);
