const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    requestorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    requestType: {
        type: String,
        enum: ['Rent Request', 'Leave Request', 'Maintenance Request'],
        required: true,
    },
    requestorName: {
        type: String,
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
    },
    message: {
        type: String,
        default: '',
    },
    requestedPrice: {
        type: {
            min: { type: Number },
            max: { type: Number },
            fixed: { type: Number },
        },
        validate: {
            validator: function (value) {
                return (
                    (value.min != null && value.max != null && value.fixed == null) || // Range
                    (value.fixed != null && value.min == null && value.max == null) || // Fixed
                    (value.min == null && value.max == null && value.fixed == null)    // None
                );
            },
            message: 'Invalid requestedPrice: Provide either a range (min and max) or a fixed price.',
        },
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { 
    toObject: { virtuals: true }, 
    toJSON: { virtuals: true } 
});

// Ensure only `_id` is populated for references
// REMOVE this block entirely OR update it to:
RequestSchema.pre(/^find/, function (next) {
  this.populate('requestorId', '_id name username profilePicture')
      .populate('ownerId', '_id name username profilePicture' )
      .populate('propertyId', '_id title location address');
  next();
});


RequestSchema.set('toObject', { transform: (doc, ret) => { delete ret.__v; return ret; } });
RequestSchema.set('toJSON', { transform: (doc, ret) => { delete ret.__v; return ret; } });

RequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Request', RequestSchema);