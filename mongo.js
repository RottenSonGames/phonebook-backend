const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('need password')
    process.exit(1)
  }

else if (process.argv.length > 5) {
    console.log('cannot be more than 5 arguments')
    process.exit(1)
  }

const password = process.argv[2]
const url = `mongodb://sanghoyou:${password}@ac-2parfjc-shard-00-00.optkffg.mongodb.net:27017,ac-2parfjc-shard-00-01.optkffg.mongodb.net:27017,ac-2parfjc-shard-00-02.optkffg.mongodb.net:27017/phonebookApp?replicaSet=atlas-vml457-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Clusterbator`
mongoose.set('strictQuery',false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 3) {
  Contact.find({}).then(returnedContacts => {
    returnedContacts.forEach(contact => {
      console.log(contact)
    })
    mongoose.connection.close()
  })
}

else {
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4]
  })
    
  contact.save().then(result => {
    console.log(`added ${contact.name} with number ${contact.number} to phonebook`)
    mongoose.connection.close()
  })
}


  
