const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

  // Custom validator function
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{2,3}-\d{5,}$/;
  return phoneRegex.test(phoneNumber);
};

const personSchema = new mongoose.Schema({
  name: {
    type:String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: validatePhoneNumber,
      message: props => `${props.value} is not a valid phone number!`
    }

  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
