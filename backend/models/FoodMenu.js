const mongoose = require("mongoose");

const foodMenuSchema = new mongoose.Schema({
  FoodID: {
    type: String,
    required: true,
  },
  foodID: {
    type: String,
    required: true,
  },
    name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  portion: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  protein: {
    type: String,
    default: ""
  },
  calories: {
    type: String,
    default: ""
  },
  ingredients: {
    type: String,
    default: ""
  },
  spiceLevel: {
    type: String,
    enum: ["Mild", "Medium", "Hot", "Very Hot"],
    default: "Mild"
  },
  portionSize: {
    type: String,
    default: ""
  },
  bestBefore: {
    type: String,
    default: ""
  },
  preparationTime: {
    type: String,
    default: ""
  },
  dietType: {
    type: String,
    enum: ["Vegetarian", "Non-Vegetarian", "Vegan"],
    default: "Vegetarian"
  },
  servingType: {
    type: String,
    enum: ["Hot meal", "Cold meal", "Beverage", "Snack"],
    default: "Hot meal"
  },
  ratingTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: 0
  }
});

module.exports = mongoose.model("FoodMenu", foodMenuSchema);