import { seedDatabase } from './seed.js';

try {
  seedDatabase();
  console.log('Seed runner completed successfully.');
  process.exit(0);
} catch (error) {
  console.error('Seed runner failed with error:', error);
  process.exit(1);
}
