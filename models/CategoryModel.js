const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      unique: [true, "Name should be unique"],
    },
    image: String,
    slug: String,
  },
  { timestamps: true }
);

// Update slug before saving the category
CategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
