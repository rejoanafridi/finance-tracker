import mongoose from "mongoose"

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    enum: ["monthly", "quarterly", "yearly"],
    default: "monthly",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
budgetSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Create a compound index on userId and category to ensure uniqueness per period
budgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true })

export const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema)
