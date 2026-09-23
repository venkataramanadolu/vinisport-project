require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    for (const user of users) {
      if (user.email === 'vinisportadmin@gmail.com') {
        user.password = 'admin@123';
      } else {
        user.password = 'player123';
      }
      await user.save();
    }
    console.log(`Fixed passwords for ${users.length} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error fixing passwords:', err);
    process.exit(1);
  }
}

fixPasswords();
