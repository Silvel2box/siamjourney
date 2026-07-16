// Promote an existing merchant to admin. Run after the account has registered:
//   ADMIN_EMAIL=you@example.com npx prisma db seed
// Idempotent — re-running on an admin just re-confirms the role.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.trim();
if (!email) {
  console.error("Set ADMIN_EMAIL to the merchant email to promote. Example:");
  console.error("  ADMIN_EMAIL=you@example.com npx prisma db seed");
  process.exit(1);
}

const merchant = await prisma.merchant.findUnique({ where: { email } });
if (!merchant) {
  console.error(`No merchant found with email "${email}". Register that account first, then re-run.`);
  process.exit(1);
}

const updated = await prisma.merchant.update({
  where: { email },
  data: { role: "admin", status: "approved" },
});
console.log(`Promoted ${updated.email} → role=admin, status=approved`);

await prisma.$disconnect();
