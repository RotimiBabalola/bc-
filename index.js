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
    //print the data
    db.each("SELECT contact_id, contact_name, contact_number FROM contacts", function(err, row){
    	console.log(row.contact_id + ":" + row.contact_name + ":" + row.contact_number)
    });

  });


 //next goal --> search the database for a contact
 program
  .command('search <name>')
  .description('search for <name>')
  .action(function(name, command){
    //do a check to see if db exists before searching
    //search for the given name

    db.all("SELECT contact_id, contact_name, contact_number FROM contacts WHERE contact_name LIKE " + "'" + "%" + name + "%';", function(err, row){
      //handle case where there is more than one contact with a given name
      if(row.length > 1){
        var rl = require('readline')
        var read = rl.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        for(i = 0; i < row.length; i++){
          console.log("[" + i + "]", row[i].contact_name, row[i].contact_number)
        }

        read.question("\nWhich " + name + "? (Enter the corresponding number to indicate the contact)", function(answer){
          read.close()
          answer = parseInt(answer); //convert the answer from string to integer
          console.log("You chose " + row[answer].contact_name, row[answer].contact_number)
        });
      }

      else{
        console.log("[" + row[0].contact_name + "]", row[0].contact_number);
      }

    });

  });

  //next goal --> user should be able to view all his contacts
program
  .command('view')
  .description('View all stored contacts')
  .action(function(command){
    //sql statement to view all contacts
    db.all("SELECT * FROM contacts ORDER BY contact_name;", function(err, row){
      console.log(row)
    });
  });

program
  .command('del <name>')
  .description('Delete <name> from contacts')
  .action(function(name, command){
    //first search the database for entries that match that name
    db.all("SELECT contact_id, contact_name, contact_number FROM contacts WHERE contact_name LIKE " + "'" + "%" + name + "%';", function(err, row){

      if(row.length > 1){
        var rl = require('readline')
        var read = rl.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        //print the retrieved data
        for(i = 0; i < row.length; i++){
          console.log("[" + i + "]", row[i].contact_name, row[i].contact_number)
        }

        read.question("\nWhich " + name + "? (Enter the corresponding number to indicate the contact you want to delete)", function(answer){
          read.close()
          answer = parseInt(answer); //convert the answer from string to integer
          db.run("DELETE FROM contacts WHERE contact_name = " + "'" + row[answer].contact_name + "'")
          console.log("Contact successfully deleted!!")
        });
      }

      else{
        db.run("DELETE FROM contacts WHERE contact_name = " +  "'" + row[0].contact_name + "'")
        console.log("Contact successfully deleted!!")
      }

    });
  });

  program.parse(process.argv)