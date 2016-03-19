'use strict';

const Connection = require('./connection');
const Schema = require('./schema');

module.exports = class Model {
  static connection() {
    if (!this._connection) {
      this._connection = new Connection();
    }
    return this._connection;
  }

  static collection() {
    if (!this._collection) {
      this._collection = this.connection().collection(this._collectionName());
    }
    return this._collection;
  }

  static schema() {
    if (!this._schema) {
      this._schema = new Schema();
      this.defineSchema(this._schema);
    }
    return this._schema;
  }

  static defineSchema() {
    // Subclass should override
  }

  static _collectionName() {
    return this.name;
  }

  static find(query) {
    return this.collection()
      .then(collection => collection.find(query).toArray())
      .then(results => results.map(result => new this(result)));
  }

  static findOne(query) {
    return this.collection()
      .then(collection => collection.findOne(query))
      .then(result => {
        if (result) {
          return new this(result);
        }
      });
  }

  constructor(mongoObject) {
    for (let key in mongoObject) {
      this[this._propertyKey(key)] = mongoObject[key];
    }

    this._defineGettersAndSetters();
  }

  _defineGettersAndSetters() {
    this.schema().fields().forEach((field) => {
      let propertyKey = this._propertyKey(field);
      this[this._getterKey(field)] = () => this[propertyKey];
      this[this._setterKey(field)] = (value) => this[propertyKey] = value;
    });
  }

  _getterKey(key) {
    return this._keyWithoutUnderscore(key);
  }

  _setterKey(key) {
    return 'set' + this._keyWithoutUnderscore(key).replace(/^./, (firstCharacter) => firstCharacter.toUpperCase());
  }

  schema() {
    return this.constructor.schema();
  }

  save() {
    if (this._id) {
      return this._update();
    } else {
      return this._insert();
    }
  }

  delete() {
    return this.constructor.collection()
      .then(collection => collection.deleteOne({ _id: this.id() }))
      .then(() => this);
  }

  beforeSave() {
    return Promise.resolve(); // Subclass may override. Return a promise.
  }

  id() {
    return this._id;
  }

  _insert() {
    return this.beforeSave()
      .then(() => this.constructor.collection())
      .then(collection => collection.insertOne(this._toMongoObject()))
      .then(result => {
        this.setId(result.insertedId);
        return this;
      });
  }

  _update() {
    return this.beforeSave()
      .then(() => this.constructor.collection())
      .then(collection => {
        return collection.updateOne({ _id: this.id() }, { $set: this._toMongoObject() });
      }).then(result => this);
  }

  _toMongoObject() {
    let mongoObject = {};
    this.schema().fields().forEach(field => {
      mongoObject[field] = this[this._getterKey(field)]();
    });
    return mongoObject;
  }

  _propertyKey(key) {
    return this._keyWithUnderscore(key);
  }

  _keyWithUnderscore(key) {
    return key.startsWith('_') ? key : `_${key}`;
  }

  _keyWithoutUnderscore(key) {
    return key.replace(/^_/, '');
  }
}
