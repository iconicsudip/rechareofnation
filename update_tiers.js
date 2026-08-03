require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL");
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  
  const defaultTiers = [
    { type: "General Admission", price: 500, available: 200, description: "Standard entry for one person." },
    { type: "VIP Pass", price: 2500, available: 50, description: "Premium seating and exclusive lounge access." },
    { type: "Sponsorship", price: 50000, available: 5, description: "Brand logo placement and 10 VIP passes." }
  ];

  const tiersJson = JSON.stringify(defaultTiers);
  
  await sql`UPDATE events SET ticket_prices = ${tiersJson}::jsonb`;
  
  console.log("Successfully updated ticket_prices for all events!");
}

main().catch(console.error);
