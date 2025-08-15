import { Knex } from 'knex';

/**
 * Create verification tokens table migration
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('verification_tokens', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign key to users
    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Token information
    table.string('token', 255).notNullable().unique();
    table.enum('type', ['email_verification', 'password_reset']).notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['token']);
    table.index(['user_id', 'type']);
    table.index(['expires_at']);
    table.index(['used']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verification_tokens');
}