require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/db');

async function main() {
  const [login, motDePasse] = process.argv.slice(2);
  if (!login || !motDePasse) {
    console.error('Usage : node scripts/create-mj.js <login> <motDePasse>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(motDePasse, 10);
  await pool.query(
    `INSERT INTO utilisateurs (login, mot_de_passe_hash) VALUES ($1, $2)
     ON CONFLICT (login) DO UPDATE SET mot_de_passe_hash = EXCLUDED.mot_de_passe_hash`,
    [login, hash]
  );
  console.log(`Compte "${login}" enregistré (empreinte bcrypt stockée).`);
}

main()
  .catch((err) => { console.error('Échec :', err.message); process.exitCode = 1; })
  .finally(() => pool.end());