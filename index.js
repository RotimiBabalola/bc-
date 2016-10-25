//import the required modules
var sqlite3 = require('sqlite3').verbose()
var program = require('commander')
var Jusibe = require('jusibe')
var rl = require('readline')


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
    	db.run("CREATE TABLE IF NOT EXISTS contacts (contact_id INTEGER PRIMARY KEY AUTOINCREMENT, contact_name TEXT NOT NULL, contact_number TEXT NOT NULL UNIQUE)");
    });

    var stmt = db.prepare("INSERT INTO contacts (contact_name, contact_number) VALUES (?, ?)");

    //add the name and phone number to the database
    stmt.run(name, phone_number)
    stmt.finalize();
    //print the data
    db.each("SELECT contact_id, contact_name, contact_number FROM contacts", function(err, row){
    	console.log(row.contact_id + " : " + row.contact_name + " : " + row.contact_number)
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


//next goal --> user should be able to delete a contact
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

//next goal --> user should be able to send an SMS to another user in his contact list
program
  .command('text <name> <short_message>')
  .option('-m, --short_message', 'Message you want to send')
  .description('Send <short_message> to <name>')
  .action(function(short_message, name, command){
    db.all("SELECT contact_name, contact_number FROM contacts WHERE contact_name LIKE " + "'" + "%" + name + "%';", function(err, row){
      //set values for jusibe's API
      jusibe_pub_key = "2f1a1c3ab844aa292dd592e7a1abacc6";
      jusibe_acc_token = "4352384c4191e982c08328308f50d09a";
      var jusibe = new Jusibe(jusibe_pub_key, jusibe_acc_token)

      if(row.length > 1){
        //create interface for collecting input from the user
        var read = rl.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        //print the retrieved data
        for(i = 0; i < row.length; i++){
          console.log("[" + i + "]", row[i].contact_name, row[i].contact_number)
        }

        read.question("\nWhich " + name + "? (Enter the corresponding number to indicate the contact you want to send the SMS to)", function(answer){

          read.close()
          answer = parseInt(answer); //convert the answer from string to integer
          
          console.log("You chose " + row[answer].contact_name)
          console.log("Sending message...")

          //send message
          var payload = {
            to: row[answer].contact_number,
            from: 'SMS_APP',
            message: short_message
          };

          //send message confirming whether or not the message was sent
         jusibe.sendSMS(payload, function(err, res){

          if(res.statusCode === 200){
            console.log(res.body);
          }
          else{
            console.log("Message not sent!!" + "\n Use the error message below to debug \n");
            console.log(err);
          }

         });

        });
      }

      else{

        var payload = {
          to: row[0].contact_number,
          from: 'SMS_APP',
          message:short_message
        };

        jusibe.sendSMS(payload, function(err, res){
          if(res.statusCode === 200){
            console.log(res.body)
          }

          else{

            console.log("Message not sent!!" + "\n Use the error message below to debug \n");
            console.log(err);
          }
        });
      }

    });
  });
  program.parse(process.argv)