function addCSRF(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
}

module.exports = addCSRF;