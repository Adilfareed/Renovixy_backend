const mongoose = require('mongoose');
const ServiceCategory = require('../models/ServiceCategory');
const connectDB = require('../config/db');

const serviceCategories = [
  { id: 'electric', label: 'Electric Work', icon: 'electrical-services' },
  { id: 'plumber', label: 'Plumber', icon: 'plumbing' },
  { id: 'appliances', label: 'Home Appliances', icon: 'kitchen' },
  { id: 'tank', label: 'Tank Cleaning', icon: 'clean-hands' },
  { id: 'construction', label: 'Construction', icon: 'domain' },
  { id: 'renovation', label: 'Renovation', icon: 'home-repair-service' },
  { id: 'carpenter', label: 'Carpenter', icon: 'carpenter' },
  { id: 'ac', label: 'AC Services', icon: 'ac-unit' },
  { id: 'shifting', label: 'Shifting', icon: 'local-shipping' },
  { id: 'packers', label: 'Packers', icon: 'inventory' },
];

const seedCategories = async () => {
  try {
    await connectDB();
    
    // Clear existing categories
    await ServiceCategory.deleteMany({});
    
    // Insert new categories
    const categories = serviceCategories.map(cat => ({
      name: cat.label,
      icon: cat.icon,
      description: `${cat.label} services`
    }));
    
    await ServiceCategory.insertMany(categories);
    
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
