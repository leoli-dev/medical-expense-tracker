import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= args.length) return undefined;
  return args[index + 1];
}

async function main() {
  const username = getArg("username");
  const password = getArg("password");
  const name = getArg("name");

  if (!username || !password || !name) {
    console.error(
      "Usage: npx tsx src/cli/create-user.ts --username <username> --password <password> --name <display_name>"
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await db
      .insert(users)
      .values({ username, passwordHash, displayName: name })
      .returning();

    console.log(`User created successfully: ${result[0].username} (ID: ${result[0].id})`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      console.error(`Error: Username "${username}" already exists`);
    } else {
      console.error("Error creating user:", error);
    }
    process.exit(1);
  }
}

main();
