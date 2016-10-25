//import the required dependencies
var sqlite3 = require('sqlite3').verbose()
var program = require('commander')
var twilio = require('twilio')
var readline = require('readline')


var db = new sqlite3.Database('contacts_db.sqlite')
//first goal create a database to store the contacts
program
  .command('add <name> <phone_number>')
  .option('-n , --name','Name of the contact')
  .option('-p, --phone_number', 'Phone number of contact')
  .description('Add a new contact')
  .action(function(name, phone_number, command) {
    //create the table if it does not exist
    db.serialize(function() {
    	db.run("CREATE TABLE IF NOT EXISTS contacts (contact_id INTEGER PRIMARY KEY AUTOINCREMENT, contact_name TEXT, contact_number TEXT)");
    });

    var stmt = db.prepare("INSERT INTO contacts (contact_name, contact_number) VALUES (?, ?)");
    //replace the first 0 in a phone number with +234
    phone_number = phone_number.replace(phone_number.charAt(0), '+234')
    //add the name and phone number to the database
    stmt.run(name, phone_number)
    stmt.finalize();
    //log the data
    db.each("SELECT contact_id, contact_name, contact_number FROM contacts", function(err, row){
    	console.log(row.contact_id + ":" + row.contact_name + ":" + row.contact_number)
    });

  });

  program.parse(process.argv)