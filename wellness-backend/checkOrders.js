import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;

    const orders = await db.collection('orders').find({}).toArray();
    const uniqueUserIds = [...new Set(orders.map(o => o.user.toString()))];

    console.log('Unique user IDs in orders:');
    for (const id of uniqueUserIds) {
        const count = orders.filter(o => o.user.toString() === id).length;
        const userExists = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(id) });
        console.log(`${id} - ${count} orders - User exists: ${!!userExists}`);
    }

    await mongoose.disconnect();
}).catch(err => console.error(err));
