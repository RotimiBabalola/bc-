//import the required dependencies
var sqlite3 = require('sqlite3').verbose()
var program = require('commander')
var twilio = require('twilio')
var readline = require('readline')

//first goal create a database to store the contacts
program
  .command('add <name> <phone_number>')
  .option('-n , --name','Name of the contact')
  .option('-p, --phone_number', 'Phone number of contact')
  .description('Add a new contact')
  .action(function(name, phone_number, command) {
    var db = new sqlite3.Database('contacts_db.sqlite')

    db.serialize(function() {
    	db.run("CREATE TABLE IF NOT EXISTS contacts (contact_name TEXT, contact_number TEXT)");
    });

    var stmt = db.prepare("INSERT INTO contacts (contact_name, contact_number) VALUES (?, ?)");
    stmt.run(name, phone_number)
    stmt.finalize();
    //log the data
    db.each("SELECT contact_name, contact_number FROM contacts", function(err, row){
    	console.log(row.contact_name + ":" + row.contact_number)
    });

  });

  program.parse(process.argv)