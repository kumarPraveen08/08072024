const mongoose = require("mongoose");
const slugify = require("slugify");

const HistorySchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true,
  },
  history: {
    type: Map,
    of: Number,
    required: true,
    default: {},
  },
  price_fetched_at: {
    type: Date,
    required: true,
  },
  lowest_price: {
    type: Number,
    required: true,
  },
  highest_price: {
    type: Number,
    required: true,
  },
  average_price: {
    type: Number,
    required: true,
  },
  in_stock: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const History = mongoose.model("History", HistorySchema);

const ProductSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: true,
    },
    country: {
      type: mongoose.Schema.ObjectId,
      ref: "Country",
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    history: {
      type: mongoose.Schema.ObjectId,
      ref: "History",
      required: true,
    },
    pid: {
      type: String,
      required: [true, "Product Id is required"],
      unique: [true, ["Product Id is already exists"]],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    slug: String,
    short_slug: String,
    image: {
      type: String,
      default: "product_fallback.jpg",
    },
    rating: {
      type: Number,
      default: 0,
    },
    rating_count: {
      type: Number,
      default: 0,
      min: [1, "Rating must be atleast 1"],
      max: [5, "Rating must cannot be more than 5"],
    },
    is_prime: {
      type: Boolean,
      default: false,
    },
    in_stock: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
    },
    lowest_price: {
      type: Number,
      required: [true, "Lowest is required"],
    },
    highest_price: {
      type: Number,
      required: [true, "Highest is required"],
    },
    average_price: {
      type: Number,
      required: [true, "Average is required"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    drop_chance: {
      type: Number,
      default: 0,
    },
    url: {
      type: "",
      required: [true, "Product URL is required"],
    },
    price_fetched_at: {
      type: Date,
      required: [true, "Price fetched at is required"],
      default: Date.now,
    },
    history_fetched_at: {
      type: Date,
      required: [true, "Price fetched at is required"],
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Update slug before saving the product
CategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
