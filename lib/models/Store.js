const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  flavors: {
    type: [String],
    required: true
  },
  sizes: {
    // Specify the type of array you have
    type: [String],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },

});

module.exports = mongoose.model('Store', storeSchema);
