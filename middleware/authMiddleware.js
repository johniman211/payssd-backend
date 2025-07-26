const protect = (req, res, next) => {
  req.user = {
    _id: 'dummy-user-id',
    role: 'admin',
    email: 'dummy@payssd.com',
    fullName: 'Dummy User',
  };
  next();
};

const adminOnly = (req, res, next) => {
  next();
};

module.exports = { protect, adminOnly };
