'use strict';

module.exports = class Schema {
  fields() {
    if (!this._fields) {
      this._fields = [];
    }
    return this._fields;
  }

  field(name) {
    this.fields().push(name);
  }
}
