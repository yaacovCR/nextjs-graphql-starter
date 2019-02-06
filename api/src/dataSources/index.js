const Knex = require('knex');
const DataLoader = require('dataloader');
const { DataSource } = require('apollo-datasource');

const knex = Knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST,
    user: 'dev',
    password: 'dev',
    database: 'dev'
  }
});

class Api extends DataSource {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.loader = new DataLoader(rawQueries =>
      Promise.all(rawQueries.map(rawQuery => knex.raw(rawQuery))).then(
        results => results.map(result => result && result.rows)
      )
    );
  }

  initialize(config) {
    this.context = config.context;
  }

  test() {
    return null;
  }
}

const dataSources = () => {
  api: new Api();
};

module.exports = {
  dataSources
};
