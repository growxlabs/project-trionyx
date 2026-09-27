import readline from 'readline';
import { runMigrations, usersRepository, auditLogsRepository } from '../packages/database/src';
import { hashPassword } from '../packages/auth/src';
import { createInternalUserSchema, type InternalPortalRole } from '../packages/validation/src';

interface CliArgs {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--name' && argv[i + 1]) args.name = argv[++i];
    else if (arg === '--email' && argv[i + 1]) args.email = argv[++i];
    else if (arg === '--role' && argv[i + 1]) args.role = argv[++i];
    else if (arg === '--password' && argv[i + 1]) args.password = argv[++i];
  }
  return args;
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  console.log('\n========================================');
  console.log('  TRIONYX INTERNAL USER BOOTSTRAP CLI');
  console.log('========================================\n');

  // Initialize DB and ensure migrations
  await runMigrations();

  const parsed = parseArgs();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    let name = parsed.name;
    let email = parsed.email;
    let role = parsed.role;
    let password = parsed.password;

    if (!name) {
      name = await ask(rl, 'Enter Full Name: ');
    }
    if (!email) {
      email = await ask(rl, 'Enter Email Address: ');
    }
    if (!role) {
      console.log('\nSelect Role:');
      console.log('  1. DISTRIBUTOR');
      console.log('  2. MANAGING_DIRECTOR');
      console.log('  3. ADMIN');
      const roleChoice = await ask(rl, 'Choose [1-3] or type role name: ');
      if (roleChoice === '1' || roleChoice.toUpperCase() === 'DISTRIBUTOR') {
        role = 'DISTRIBUTOR';
      } else if (roleChoice === '2' || roleChoice.toUpperCase() === 'MANAGING_DIRECTOR') {
        role = 'MANAGING_DIRECTOR';
      } else if (roleChoice === '3' || roleChoice.toUpperCase() === 'ADMIN') {
        role = 'ADMIN';
      } else {
        role = roleChoice.toUpperCase();
      }
    }
    if (!password) {
      password = await ask(rl, 'Enter Password (min 8 chars): ');
    }

    // Validate inputs
    const validated = createInternalUserSchema.parse({
      name,
      email,
      role,
      password,
    });

    // Check if user already exists
    const existing = await usersRepository.findByEmail(validated.email);
    if (existing) {
      console.error(`\n[ERROR] An account with email "${validated.email}" already exists.`);
      process.exit(1);
    }

    // Hash password with Argon2id
    console.log('\nHashing credentials with Argon2id...');
    const passwordHash = await hashPassword(validated.password);

    // Create user in database
    const user = await usersRepository.create({
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: validated.role as InternalPortalRole,
      status: 'ACTIVE',
    });

    // Record audit event
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'USER_BOOTSTRAPPED',
      metadata: { role: user.role, email: user.email },
    });

    console.log('\n✔ Internal user created successfully!');
    console.log('----------------------------------------');
    console.log(`  User ID: ${user.id}`);
    console.log(`  Name:    ${user.name}`);
    console.log(`  Email:   ${user.email}`);
    console.log(`  Role:    ${user.role}`);
    console.log(`  Status:  ${user.status}`);
    console.log('----------------------------------------\n');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('\n[ERROR]', err.message);
    } else {
      console.error('\n[ERROR] Unexpected error during account creation');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
