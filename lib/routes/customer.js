const { Router } = require('express');
const Customer = require('../models/Customer'); -
const Purchase = require('../models/Purchase');
const { HttpError } = require('../middleware/error');
const { ensureAuth } = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    const { name, phone } = req.body;
    Customer
      .create({
        name,
        phone
      })
      .then(customer => res.send(customer))
      .catch(next);
  })

  // do a bit more here!
  // Maybe send along the last ten purchases made by this customer?
  .get('/:id', ensureAuth, (req, res, next) => {
    const _id = req.params.id;
    Promise.all([
      Purchase.find({ customer: _id }).limit(10).lean(),
      Customer.findById(_id).select('-__v').lean()
    ])
      .then(([purchases, foundCustomer]) => {
        if (!foundCustomer) {
          return next(new HttpError(404, `No user found with id ${_id}`));
        }

        res.send({ ...foundCustomer, purchases });
      })
      .catch(next);
  })

  .get('/', ensureAuth, (req, res, next) => {
    Customer
      .find()
      .then(customers => { res.send(customers); })
      .catch(next);
  })

  .patch('/:id', ensureAuth, (req, res, next) => {
    const id = req.params.id;
    const { name, phone } = req.body;
    Customer
      .findByIdAndUpdate(id, { name, phone }, { new: true })
      .then(updated => {
        res.send(updated);
      })
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    const id = req.params.id;
    Customer
      .findByIdAndDelete(id)
      .then(deleted => {
        res.send(deleted);
      })
      .catch(next);
  });
