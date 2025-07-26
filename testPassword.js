const bcrypt = require('bcryptjs');

const inputPassword = 'password123'; // What you're entering in login form
const hashedPasswordFromDB =
  '$2a$10$jfAevzCuwMxryyBkhMyb9u0CwzXBalfOANOtUx.EehALgBt/nvcYG'; // Example from merchant

bcrypt.compare(inputPassword, hashedPasswordFromDB).then((match) => {
  console.log('Match?', match); // should return true
});
