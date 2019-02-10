const { Router } = require('express');
const Purchase = require('../models/Purchase');
const { HttpError } = require('../middleware/error');
const { ensureAuth } = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    const { flavor, size, price, store } = req.body;
    Purchase
      .create({
        flavor,
        size,
        price,
        store
      })
      .then(purchase => res.send(purchase))
      .catch(next);
  })

  .get('/:id', ensureAuth, (req, res, next) => {
    const id = req.params.id;
    Purchase
      .findById(id)
      // its nice to populate these items here
      .populate('store')
      .populate('customer')
      .then(foundPurchase => {
        if(!foundPurchase) {
          return new HttpError(404, `No purchase found with id: ${id}`);
        }
        res.send(foundPurchase);
      })
      .catch(next);
  })

  .get('/stats/revPerStore', ensureAuth, (req, res, next) => {
    Purchase
      .revPerStore()
      .then(data => res.send(data))
      .catch(next);
  })

  .get('/stats/revPerFranchise', ensureAuth, (req, res, next) => {
    Purchase
      .revPerFranchise()
      .then(data => res.send(data))
      .catch(next);
  })

  .get('/stats/top5flavors', ensureAuth, (req, res, next) => {
    Purchase
      .top5flavors()
      .then(data => res.send(data))
      .catch(next);
  })

  .get('/stats/topSpendingCustomers', ensureAuth, (req, res, next) => {
    Purchase
      .topSpendingCustomers()
      .then(data => res.send(data))
      .catch(next);
  })

  // add some searchability to your purchases
  // you can then go to /purchase?size=kids&flavor=vanilla
  // and it will return only purchases where size is kids
  // and flavor is vanilla
  .get('/', ensureAuth, (req, res, next) => {
    // if this query building gets long, extract it
    // into its own module
    const query = {};
    if(req.query.size) {
      query.size = req.query.size;
    }
    if(req.query.store) {
      query.store = req.query.store;
    }
    if(req.query.flavor) {
      query.flavor = req.query.flavor;
    }
    if(req.query.customer) {
      query.customer = req.query.customer;
    }
    Purchase
      .find(query)
      .then(purchases => { res.send(purchases); })
      .catch(next);
  });
