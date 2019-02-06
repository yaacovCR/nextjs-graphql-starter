exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', function(t) {
    t.string('email').primary();
    t.string('password').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user');
};
