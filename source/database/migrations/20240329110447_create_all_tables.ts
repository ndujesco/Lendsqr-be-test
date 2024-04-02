import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.increments('user_id').primary().notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('password').notNullable();
      table.string('email').unique().notNullable();
      table.boolean('is_verified').defaultTo(false).notNullable();
      table.string('otp').notNullable();
      table.string('phone').notNullable();
      table.timestamps(true, true);
    })

    .createTable('wallet', (table) => {
      table.increments('wallet_id').primary().notNullable();
      table.float('balance').defaultTo(0).notNullable();
      table.string('wallet_number').unique().notNullable();
      table.timestamps(true, true);

      table
        .integer('owner')
        .unsigned()
        .references('user_id')
        .inTable('user')
        .onDelete('CASCADE')
        .notNullable();
    })

    .createTable('transaction', (table) => {
      table.increments('transaction_id').primary().notNullable();
      table.uuid('transaction_uuid').defaultTo(knex.fn.uuid()).notNullable();
      table
        .enu('transaction_type', ['topup', 'withdrawal', 'transfer'])
        .notNullable();

      table.float('amount').notNullable();
      table.float('sender_balance').nullable(); // not to be returned
      table.float('receiver_balance').nullable(); // these fields will not be returned to user instead a 'walletBalance' field will be returned which will be either sender_balance or receiver_balance
      table.text('remark').nullable();
      table.boolean('is_successful').defaultTo(false).notNullable();
      table.timestamps(true, true);
      table
        .integer('sender')
        .unsigned()
        .references('user_id')
        .inTable('user')
        .nullable();

      table
        .integer('receiver')
        .unsigned()
        .references('user_id')
        .inTable('user')
        .nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('transaction')
    .dropTableIfExists('wallet')
    .dropTableIfExists('user');
}
