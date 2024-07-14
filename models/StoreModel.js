const mongoose = require("mongoose");
const slugify = require("slugify");

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: 25,
    },
    slug: String,
    prime_image: String,
    image: String,
    is_searchable: {
      type: Boolean,
      default: false,
    },
    search_url: String,
    search_seperator: String,
    domain: {
      type: String,
      required: [true, "Domain is required"],
      maxLength: 25,
    },
  },
  { timestamps: true }
);

StoreSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Store", StoreSchema);
