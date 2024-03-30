import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('user', (table) => {
      table.increments('userId').primary().notNullable();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('password').notNullable();
      table.string('email').unique().notNullable();
      table.boolean('isVerified').defaultTo(false).notNullable();
      table.string('otp').notNullable();
      table.string('phone').notNullable();
      table
        .dateTime('createdAt')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        .notNullable();
      table
        .dateTime('updatedAt')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
        .notNullable();
    })

    .createTable('wallet', (table) => {
      table.increments('walletId').primary().notNullable();
      table.float('balance').defaultTo(0).notNullable();
      table.string('walletNumber').unique().notNullable();
      table
        .dateTime('createdAt')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        .notNullable();
      table
        .dateTime('updatedAt')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
        .notNullable();

      table
        .integer('owner')
        .unsigned()
        .references('userId')
        .inTable('user')
        .onDelete('CASCADE')
        .notNullable();
    })

    .createTable('transaction', (table) => {
      table.increments('transactionId').primary().notNullable();
      table.uuid('transactionUUID').defaultTo(knex.fn.uuid()).notNullable();
      table
        .enu('transactionType', ['topUp', 'withdrawal', 'transfer'])
        .notNullable();
      table.float('amount').notNullable();
      table.float('senderBalance').nullable(); // not to be returned
      table.float('receiverBalance').nullable(); // these fields will not be returned to user instead a 'walletBalance' field will be returned which will be either senderBalance or receiverBalance

      table.string('remark').nullable();
      table.dateTime('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table
        .dateTime('updatedAt')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
        .notNullable();

      table
        .integer('sender')
        .unsigned()
        .references('userId')
        .inTable('user')
        .onDelete('CASCADE')
        .notNullable();

      table
        .integer('receiver')
        .unsigned()
        .references('userId')
        .inTable('user')
        .onDelete('CASCADE')
        .notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {}
