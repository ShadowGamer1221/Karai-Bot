import mongoose from 'mongoose';

function connect() {
  // Load environment variables from .env file
  require('dotenv').config();

  // Set up Mongoose connection options
  const mongooseOptions: mongoose.ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any;

  mongoose.set('strictQuery', false);

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_TOKEN, mongooseOptions)
    .then(() => {
      console.log('Database >> MongoDB is connected!');
    })
    .catch((err) => {
      console.error('[ERROR] >> MongoDB >> Failed to connect! >> Error:', err);
      console.log('Exiting...');
      process.exit(1);
    });

  // Set up event listeners
  mongoose.connection.once('open', () => {
    console.log('Database >> MongoDB is ready!');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[ERROR] >> Database >> Failed to connect to MongoDB! >> Error:', err);
    console.log('Exiting...');
    process.exit(1);
  });
}

export default connect;