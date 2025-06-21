class FakeModel {
  constructor(data) { Object.assign(this, data); }
  static async findOne() { return null; }
  static async findById() { return null; }
  static async create(data) { return new FakeModel(data); }
  static async countDocuments() { return 0; }
  static async find() { return []; }
  save() { return Promise.resolve(this); }
}
class Schema {
  constructor(def, opts) {
    this.def = def; this.opts = opts; this.statics = {}; this.methods = {};
  }
  pre() {}
  index() {}
  virtual() { return { get() {}, set() {} }; }
  post() {}
  set() {}
  plugin() {}
}
function model(name, schema) {
  return FakeModel;
}
Schema.Types = { Mixed: class Mixed {}, ObjectId: class ObjectId {} };
function connect() { return Promise.resolve(); }
module.exports = { Schema, model, Types: Schema.Types, connect };
