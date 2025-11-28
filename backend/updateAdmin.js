const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO = 'mongodb://localhost:27017/job_portal';
const NEW_HASH = '$2a$10$icd/2lXbqlUSZ2V0/CVZ5ep8a.kU6U7hLCE2w5skdAnrmWzT6.oju';

const run = async () => {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Mongo');

    const result = await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      { $set: { password: NEW_HASH } },
      { new: true, useFindAndModify: false }
    );

    if (!result) {
      console.log('Admin user not found');
    } else {
      console.log('Updated admin user password hash:', result.email);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
