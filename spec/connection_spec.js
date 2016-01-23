'use strict';

const Connection = require('../lib/connection');

describe('Connection', () => {
  afterEach(() => {
    Connection.resetConfig();
  });

  describe('.config', () => {
    it('has sensible defaults', () => {
      expect(Connection.config()).toEqual({
        host: 'localhost',
        port: '27017',
        database: 'test'
      });
    });
  });

  describe('.configure', () => {
    it('allows configuring how to connect to the Mongo database', () => {
      Connection.configure(config => {
        config.host = '1.1.1.1';
        config.port = '1337';
        config.database = 'test2';
      });

      expect(Connection.config()).toEqual({
        host: '1.1.1.1',
        port: '1337',
        database: 'test2'
      });
    });
  });

  describe('.resetConfig', () => {
    it('resets the configuration to the default', () => {
      Connection.configure(config => {
        config.host = 'google.com';
        config.port = '80';
        config.database = '';
      });

      Connection.resetConfig();

      expect(Connection.config()).toEqual({
        host: 'localhost',
        port: '27017',
        database: 'test'
      })
    });
  });

  describe('#url', () => {
    it('returns the correct URL for the current configuration', () => {
      let connection = new Connection();
      expect(connection.url()).toEqual('mongodb://localhost:27017/test');

      Connection.configure(config => {
        config.host = 'example.com';
        config.port = '1337';
        config.database = 'exemplary';
      });

      expect(connection.url()).toEqual('mongodb://example.com:1337/exemplary');
    });
  });

  describe('#db', () => {
    it('returns a promise that resolves to the configured database', done => {
      let connection = new Connection();
      connection.db().then(db => {
        expect(db).toBeDefined();
        done();
      });
    });
  });

  describe('#collection', () => {
    it('returns a promise that resolves to the requested collection', done => {
      let connection = new Connection();
      connection.collection('squirrels').then(collection => {
        expect(collection).toBeDefined();
        expect(collection.collectionName).toEqual('squirrels');
        done();
      });
    });
  });
});
