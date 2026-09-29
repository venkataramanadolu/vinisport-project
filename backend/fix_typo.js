const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await User.findOne({email: 'allsport@gmail.com'});
    if (user && user.interestedSport === 'batminton') {
        user.interestedSport = 'badminton';
        await user.save();
        console.log('Fixed typo in interestedSport');
    } else {
        console.log('No typo found or user missing');
    }
    process.exit(0);
});
