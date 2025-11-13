import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL);

const users = await db.execute("SELECT id, openId, name, email, role FROM users LIMIT 5");
console.log("Users in database:");
console.log(JSON.stringify(users, null, 2));

console.log("\nOwner OpenId from ENV:");
console.log(process.env.OWNER_OPEN_ID);
