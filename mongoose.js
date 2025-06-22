class FakeQuery {
  constructor(result) {
    this.result = result;
  }
  skip() { return this; }
  limit() { return this; }
  sort() { return this; }
  then(res, rej) { return Promise.resolve(this.result).then(res, rej); }
}

class FakeModel {
  constructor(data) { Object.assign(this, data); }
  static async findOne() { return null; }
  static async findById() { return null; }
  static async create(data) { return new FakeModel(data); }
  static async countDocuments() { return 0; }
  static find() { return new FakeQuery([]); }
  static async findByIdAndUpdate(id, update, opts) { return new FakeModel(update); }
  static async findByIdAndDelete() { return null; }
  static async exists() { return false; }
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
