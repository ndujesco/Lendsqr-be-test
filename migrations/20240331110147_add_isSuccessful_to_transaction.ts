import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transaction', (table) => {
    table.boolean('isSuccessful').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {}
