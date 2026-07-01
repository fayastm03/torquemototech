// utils/seeder.js
// WHY: Seeds the database with motorcycle products, used bikes, and users for Torque MotoTech.

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Bike from "../models/Bike.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Booking from "../models/Booking.js";
import Rental from "../models/Rental.js";

dotenv.config();

// ─── Sample Users ──────────────────────────────────────────────────────────
const sampleUsers = [
  {
    name: "Torque Admin",
    email: "admin@torquemototech.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    password: "password123",
    role: "user",
  },
];

// ─── Sample Products (Parts, Accessories, Gear) ───────────────────────────
const getSampleProducts = (adminId) => [
  {
    createdBy: adminId,
    name: "Brembo High Performance Brake Pads",
    description: "Premium Brembo brake pads offering superior stopping power, durability, and fade resistance for modern sports motorcycles.",
    price: 3450,
    discountedPrice: 2999,
    category: "Spare Parts",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"],
    brand: "Brembo",
    rating: 4.8,
    numReviews: 12,
  },
  {
    createdBy: adminId,
    name: "DID Gold O-Ring Drive Chain 120L",
    description: "High-strength DID O-Ring chain engineered for excellent power transfer and long-lasting wear resistance.",
    price: 5200,
    discountedPrice: 4800,
    category: "Spare Parts",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600"],
    brand: "DID",
    rating: 4.9,
    numReviews: 8,
  },
  {
    createdBy: adminId,
    name: "Motul 7100 4T 10W40 Synthetic Engine Oil",
    description: "100% synthetic 4-Stroke motorcycle engine oil with Ester technology. Improves engine response and gearbox protection.",
    price: 1150,
    discountedPrice: 999,
    category: "Spare Parts",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600"],
    brand: "Motul",
    rating: 4.7,
    numReviews: 45,
  },
  {
    createdBy: adminId,
    name: "MT Hummer Solid Helmet",
    description: "ECE & DOT certified lightweight street helmet with aerodynamic shell, quick release visor, and high-impact absorption liner.",
    price: 5500,
    discountedPrice: 4999,
    category: "Accessories",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600"],
    brand: "MT Helmets",
    rating: 4.6,
    numReviews: 22,
  },
  {
    createdBy: adminId,
    name: "Rynox Air GT Riding Gloves",
    description: "Highly ventilated mesh and leather street riding gloves featuring Knox knuckle protection and touch-screen compatibility.",
    price: 2800,
    discountedPrice: 2499,
    category: "Accessories",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1598209279122-8541218a0387?w=600"],
    brand: "Rynox",
    rating: 4.5,
    numReviews: 18,
  },
  {
    createdBy: adminId,
    name: "BOBO Claw Mobile Holder with USB Charger",
    description: "Premium heavy-duty aluminum mobile holder featuring a claw grip with integrated fast-charging USB port.",
    price: 1800,
    discountedPrice: 1499,
    category: "Accessories",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=600"],
    brand: "BOBO",
    rating: 4.4,
    numReviews: 35,
  },
  {
    createdBy: adminId,
    name: "Alpinestars T-GP Plus R Riding Jacket",
    description: "Premium sports-riding jacket with highly durable and abrasion-resistant poly-fabric main shell and class-leading protection.",
    price: 19500,
    discountedPrice: 17999,
    category: "Riding Gear",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600"],
    brand: "Alpinestars",
    rating: 4.9,
    numReviews: 14,
  },
  {
    createdBy: adminId,
    name: "Orazo Picus Protective Riding Shoes",
    description: "Water-resistant, heavy-duty protective motorcycle touring boots with steel-toe reinforcement and ankle protectors.",
    price: 4500,
    discountedPrice: 3999,
    category: "Riding Gear",
    stock: 12,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    brand: "Orazo",
    rating: 4.3,
    numReviews: 9,
  },
];

// ─── Sample Used Bikes ─────────────────────────────────────────────────────
const getSampleBikes = (adminId) => [
  {
    brand: "Yamaha",
    model: "YZF R15 V3",
    year: 2021,
    kmDriven: 18500,
    price: 135000,
    condition: "Excellent",
    description: "Meticulously maintained Yamaha R15 V3 in Racing Blue. Fully serviced at Torque MotoTech. Brand new rear tyre, zero accidents, single owner.",
    images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600"],
    createdBy: adminId,
    status: "Available",
  },
  {
    brand: "KTM",
    model: "Duke 200",
    year: 2020,
    kmDriven: 24000,
    price: 120000,
    condition: "Very Good",
    description: "Fast and aggressive KTM Duke 200. Serviced regularly, fresh Motul synthetic oil. Aftermarket handguards installed. Perfect city streetfighter.",
    images: ["https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600"],
    createdBy: adminId,
    status: "Available",
  },
  {
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2019,
    kmDriven: 28000,
    price: 145000,
    condition: "Good",
    description: "Royal Enfield Classic 350 Stealth Black. Custom exhaust installed (original exhaust available). Vintage feel with absolute reliability.",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600"],
    createdBy: adminId,
    status: "Available",
  },
];

// ─── Sample Rentals ────────────────────────────────────────────────────────
const getSampleRentals = (adminId) => [
  {
    name: "Royal Enfield Himalayan 411",
    type: "Bike",
    ratePerDay: 1200,
    transmission: "Manual",
    fuelType: "Petrol",
    description: "Ultimate adventure tourer. Perfect for long rides and off-road tracks. Well-maintained and fitted with custom crash guards and luggage racks.",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600"],
    availability: true,
    createdBy: adminId,
  },
  {
    name: "KTM Duke 250",
    type: "Bike",
    ratePerDay: 1000,
    transmission: "Manual",
    fuelType: "Petrol",
    description: "High-performance street naked motorcycle. Nimble, aggressive, and perfect for city commuting and quick weekend getaways.",
    images: ["https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600"],
    availability: true,
    createdBy: adminId,
  },
  {
    name: "Maruti Suzuki Swift",
    type: "Car",
    ratePerDay: 1800,
    transmission: "Manual",
    fuelType: "Petrol",
    description: "Reliable hatchback with excellent fuel economy and comfort. Perfect for family trips and driving around Kannur city.",
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600"],
    availability: true,
    createdBy: adminId,
  },
  {
    name: "Mahindra Thar 4x4",
    type: "Car",
    ratePerDay: 3500,
    transmission: "Automatic",
    fuelType: "Diesel",
    description: "Rugged 4x4 SUV. Open road presence, raw power, and ultimate capability. Best choice for weekend road trips.",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600"],
    availability: true,
    createdBy: adminId,
  },
];

// ─── Import Data ───────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clean existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Bike.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Booking.deleteMany();
    await Rental.deleteMany();
    console.log("🗑️ Existing data cleared");

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const adminUser = createdUsers[0];
    console.log(`👤 ${createdUsers.length} users seeded`);

    // Create products
    const sampleProducts = getSampleProducts(adminUser._id);
    await Product.insertMany(sampleProducts);
    console.log(`📦 ${sampleProducts.length} motorcycle products seeded`);

    // Create bikes
    const sampleBikes = getSampleBikes(adminUser._id);
    await Bike.insertMany(sampleBikes);
    console.log(`🏍️ ${sampleBikes.length} pre-owned bikes seeded`);

    // Create rentals
    const sampleRentals = getSampleRentals(adminUser._id);
    await Rental.insertMany(sampleRentals);
    console.log(`🚗 ${sampleRentals.length} rental vehicles seeded`);

    console.log("\n🎉 Torque MotoTech Database Seeded Successfully!");
    console.log("────────────────────────────────────────────────");
    console.log("Admin Login:");
    console.log("  Email:    admin@torquemototech.com");
    console.log("  Password: admin123");
    console.log("────────────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
};

// ─── Destroy All Data ──────────────────────────────────────────────────────
const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Product.deleteMany();
    await Bike.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Booking.deleteMany();
    await Rental.deleteMany();

    console.log("🗑️ All data destroyed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Destroy error:", error);
    process.exit(1);
  }
};

if (process.argv[2] === "--delete") {
  destroyData();
} else {
  importData();
}
