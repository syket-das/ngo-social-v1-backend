const jwt = require('jsonwebtoken');

const generateToken = (id, ...rest) => {
  const token = jwt.sign(
    {
      id,
      role: rest[0],
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: '1d',
    }
  );
  return token;
};

module.exports = generateToken;
