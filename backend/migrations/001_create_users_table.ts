import { Knex } from 'knex';

/**
 * Create users table migration
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Basic user information
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    
    // Account status
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    
    // Two-factor authentication
    table.boolean('two_factor_enabled').defaultTo(false);
    table.string('two_factor_secret', 255);
    
    // Security
    table.integer('failed_login_attempts').defaultTo(0);
    table.timestamp('locked_until');
    table.timestamp('last_login');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['is_active']);
    table.index(['is_verified']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}