const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  flavor: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  store: {
    type: mongoose.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'Customer',
    required: true
  }
});

// create function for your aggregation stages.
// This promotes reuse and readability.
const groupStoreRev = () => ({
  $group: {
    _id: '$store',
    rev: { $sum: '$price' }
  }
});

const lookupStore = (localField, as = 'storeName') => ({
  $lookup: {
    from: 'stores',
    localField,
    foreignField: '_id',
    as
  }
});

const unwind = (path) => ({
  $unwind: {
    path: `$${path}`
  }
});

// Revenue per store
purchaseSchema.statics.revPerStore = function() {
  return this.aggregate([
    groupStoreRev(),
    lookupStore('_id'),
    unwind('storeName'),
    { $project: { rev: true, name: '$storeName.name', address: '$storeName.address', } },
    { $sort: { rev: -1 } }
  ]);
};
// Revenue by franchise name
purchaseSchema.statics.revPerFranchise = function() {
  return this.aggregate([
    groupStoreRev(),
    lookupStore('_id'),
    unwind('storeName'),
    {
      $group: {
        _id: {
          id: '$_id',
          name: '$storeName.name'
        },
        franchiseRevenue: {
          $sum: '$rev'
        }
      }
    },
    {
      $project: {
        franchiseRevenue: true,
        name: true
      }
    },
    {
      $sort: {
        franchiseRevenue: -1
      }
    }]);

};
//Top 5 most purchased flavors of all history ever
//purchaseSchema.statics.revPerFranchise = function() {
purchaseSchema.statics.top5flavors = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$flavor',
        count: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    { $limit: 5 }
  ]);
};
// Top spending customers
purchaseSchema.statics.topSpendingCustomers = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$customer',
        rev: {
          $sum: '$price'
        }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerName'
      }
    },
    {
      $unwind: {
        path: '$customerName'
      }
    },
    {
      $sort: {
        rev: -1
      }
    }
  ]);
};

module.exports = mongoose.model('Purchase', purchaseSchema);
