const bcrypt = require('bcrypt');

// Plaintext password
const plaintext = 'securePassword123';
const cost = 12; // Cost factor

// Hash the password
bcrypt.hash(plaintext, cost, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Bcrypt Hash:', hash);
});