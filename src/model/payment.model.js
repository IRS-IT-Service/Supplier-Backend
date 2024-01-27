const mongoose = require('mongoose')

const paymentSchema = mongoose.Schema({
    VendorId:{
        type:String,
        required:[true]
    },
    PaymentAmount:{
        type:Number,
        required:[true]
    },
    ReferenceId:{
        type:String,
        required:[true],
        unique: [true],
    },
    PI_no:{
        type:String,
        required:[true],
        unique: [true],
    },
    isFullfilledClient:{
        type:Boolean,
        default:false,
    },
    isFullfilledAdmin:{
        type:Boolean,
        default:false,
    },
    isRetry:{
        type:Boolean,
        default:false,
    },
    PaymentDate:{
        type:Date,
        required:[true]
    },
    PaymentRecievedUSD:{
        type:Number,
        default:0
    },
    
    PaymentRecievedDate:{
        type:Date
    },
   
    swiftFile:{
        type:String
    },
    piFile:{
        type:String
    },
    RecievedFile:{
        type:String
    },
    otherinfo:{
        type:Object
    }
  
},{
    timestamps:true,
})

module.exports = mongoose.model('Payment', paymentSchema)