import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full recipient name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    houseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    street: {
      type: String,
      required: [true, 'Please provide street address / locality'],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      default: '',
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
      default: 'Delhi NCR',
    },
    pincode: {
      type: String,
      required: [true, 'Please provide 6-digit postal pincode'],
      trim: true,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit postal pincode'],
    },
    addressType: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure only one default address per user
addressSchema.pre('save', async function () {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false },
    )
  }
})

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema)

export default Address
