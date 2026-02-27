import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Product from './models/productsModel.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({});
    for (let p of products) {
        if (p.images && p.images.length === 2 && p.images[0].startsWith('data:image')) {
            p.images = [p.images[0] + ',' + p.images[1]];
            await p.save();
            console.log('Fixed', p.name);
        } else if (p.images && p.images.length > 2 && p.images[0].startsWith('data:image')) {
            p.images = [p.images[0] + ',' + p.images[1], ...p.images.slice(2)];
            await p.save();
            console.log('Fixed multiple', p.name);
        }
    }
    console.log('Done');
    process.exit(0);
}

run();
