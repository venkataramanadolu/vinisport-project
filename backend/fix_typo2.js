const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await User.findOne({email: 'allsport@gmail.com'});
    if (user) {
        user.interestedSport = 'all';
        await user.save();
        console.log('Fixed interestedSport to "all"');
    } else {
        console.log('User missing');
    }
    process.exit(0);
});
