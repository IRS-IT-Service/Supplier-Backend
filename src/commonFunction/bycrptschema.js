const bcrypt = require('bcrypt');

function setupBcryptSchema(schema) {
  schema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  schema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
}

module.exports = setupBcryptSchema;
