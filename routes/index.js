var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/dataset', (req, res) => {
  res.render('dataset');
});

router.get('/block-explorer', (req, res) => {
  res.render('blockExplorer', { page: 'blockExplorer' });
});

router.get('/:page', function(req, res, next) {
    res.render(req.params.page, {page: req.params.page});
});

module.exports = router;
