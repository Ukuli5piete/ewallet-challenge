const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  const users = await User.find({ email: { $ne: req.user.email } });
  res.render('dashboard', {
    user: req.user,
    allUsers: users,
  });
});

router.put('/send', ensureAuthenticated, async (req, res) => {
  const { user, amount } = req.body;
  let fee1 = 200;
  let fee2 = 1000;
  let transactionFee1 = +amount + fee1;
  let transactionFee2 = +amount + fee2;
  const userId = mongoose.Types.ObjectId(user);

  if (amount > req.user.walletBalance) {
    req.flash('error_msg', 'insufficient funds');
    return res.redirect('/dashboard');
  }

  if (amount < 10000) {
    // send transcation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        walletBalance: -amount,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        walletBalance: amount,
      },
    });
    req.flash('success_msg', `you account has been credited ${amount}`);
    return res.redirect('/dashboard');
  }

  if (
    req.user.walletBalance >= transactionFee2 ||
    (amount >= 10000 && amount < 100000)
  ) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        walletBalance: -transactionFee1,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        walletBalance: amount,
      },
    });
    req.flash(
      'success_msg',
      `you account has been credited ${amount} , with transaction fee of ${fee1}`
    );
    return res.redirect('/dashboard');
  }

  if (req.user.walletBalance >= transactionFee2 || amount >= 100000) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        walletBalance: -transactionFee2,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        walletBalance: amount,
      },
    });
    req.flash(
      'success_msg',
      `you account has been credited ${amount} , with transaction fee of ${fee2}`
    );
    return res.redirect('/dashboard');
  }

  req.flash(
    'error_msg',
    'insufficient funds , we charge 200 for 10,000 - 100,000  and 1000 for 100,000 - above'
  );

  return res.redirect('/dashboard');
});

module.exports = router;
