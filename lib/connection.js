'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = class Connection {
  static configure(callback) {
    callback(this.config());
  }

  static config() {
    if (!this._config) {
      this._config = {
        host: 'localhost',
        port: '27017',
        database: 'test'
      }
    }
    return this._config;
  }

  static resetConfig() {
    this._config = null;
  }

  url() {
    let config = this.constructor.config();
    return `mongodb://${config.host}:${config.port}/${config.database}`;
  }

  db() {
    if (!this._db) {
      this._db = MongoClient.connect(this.url());
    }
    return this._db;
  }

  collection(name) {
    return this.db().then(db => db.collection(name));
  }
}
