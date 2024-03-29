import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.uuid('userId', { primaryKey: true }).defaultTo(knex.fn.uuid());
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('password').notNullable();
      table.string('email').notNullable();
      table.string('phone').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })

    .createTable('transaction', (table) => {
      table.uuid('transactionId').defaultTo(knex.fn.uuid());
      table.enu('transactionType', ['topUp', 'withdrawal', 'transfer']).notNullable();
      table.float('amount').notNullable();
      table.string('remark').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());

      table
        .uuid('senderWallet')
        .references('walletId')
        .inTable('wallet')
        .onDelete('CASCADE');

      table
        .uuid('receiverWallet')
        .references('walletId')
        .inTable('wallet')
        .onDelete('CASCADE');
    })

    .createTable('wallet', (table) => {
      table.uuid('walletId', { primaryKey: true }).defaultTo(knex.fn.uuid());
      table.float('balance').defaultTo(0);
      table.string('walletNumber').unique();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());

      table
        .uuid('user')
        .references('userId')
        .inTable('user')
        .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {}
