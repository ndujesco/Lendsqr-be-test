import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.increments('userId').primary();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('password').notNullable();
      table.string('email').notNullable().unique();
      table.boolean('isVerified').notNullable().defaultTo(false);
      table.string('otp').notNullable().defaultTo(false);
      table.string('phone').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })

    .createTable('wallet', (table) => {
      table.increments('walletId').primary();
      table.float('balance').defaultTo(0);
      table.string('walletNumber').unique();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());

      table
        .integer('owner')
        .unsigned()
        .references('userId')
        .inTable('user')
        .onDelete('CASCADE');
    })

    .createTable('transaction', (table) => {
      table.increments('transactionId').primary();
      table
        .enu('transactionType', ['topUp', 'withdrawal', 'transfer'])
        .notNullable();
      table.float('amount').notNullable();
      table.string('remark').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());

      table
        .integer('senderWallet')
        .unsigned()
        .references('walletId')
        .inTable('wallet')
        .onDelete('CASCADE');

      table
        .integer('receiverWallet')
        .unsigned()
        .references('walletId')
        .inTable('wallet')
        .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {}
