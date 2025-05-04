import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a compound index on userId and name to ensure uniqueness
categorySchema.index({ userId: 1, name: 1 }, { unique: true })

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)
