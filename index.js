#!/usr/bin/env node 

//import the required modules
var sqlite3 = require('sqlite3').verbose()
var program = require('commander')
var Jusibe = require('jusibe')
var rl = require('readline')
var chalk = require('chalk')
require('console.table')
var Table = require('cli-table')
var dotenv = require('dotenv');

dotenv.load();


//create table objects specifying parameters for the table
var table = new Table({
  head: ['ID', 'Contact Name', 'Phone Number'], 
  colWidths: [5, 17, 15]
});

var table_search = new Table({
  head: ['Option', 'Contact Name', 'Phone Number'],
  colWidths: [8, 17, 15]
});

var db = new sqlite3.Database('contacts_db.sqlite')

//set values for jusibe's API
var jusibe_pub_key = process.env.jusibe_pub_key;
var jusibe_acc_token = process.env.jusibe_acc_token;

var jusibe = new Jusibe(jusibe_pub_key, jusibe_acc_token)

//First I create some useful functions

//function to check if the contacts database table exists
function checkIfDBExists(){
  db.serialize(function(){  
    db.get("SELECT * FROM sqlite_master WHERE type='table' AND name = 'contacts';", function(err, row){
    if(row === undefined){
      return(true);
     }
    else{
      return(false);
    }
   });
  });
}

//function to print a message confirming whether or not a message was sent
function confirmSMS(payload){
  jusibe.sendSMS(payload, function(err, res){
    if(res.statusCode === 200){
      console.table('Message status', res.body)
    }
    else{
      //prints error message in red
      console.log(chalk.bold.red("Message not sent!!" + "\n Check the number and/or ensure you are connected to the internet \n"));
    }
  });
}

//function to send SMS
function sendSMS(name, message){
  db.all("SELECT contact_name, contact_number FROM contacts WHERE contact_name LIKE " + "'" + "%" + name + "%';", function(err, row){
    if(row.length > 1){
      //create interface for collecting input from the user
      var read = rl.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      //print members of the array in a table
      for(i = 0; i < row.length; i++){
        table_search.push(
          [i, row[i].contact_name, row[i].contact_number]
        )
      }
      console.log(table_search.toString());

      read.question("\nWhich " + name + "? (Enter the corresponding option to indicate who you want to send the SMS to) ", function(answer){
        read.close();
        answer = parseInt(answer);

        console.log("You chose " + row[answer].contact_name);
        console.log("Sending message...");

        var payload = {
          to: row[answer].contact_number,
          from: 'Contacto',
          message: message
        }

        //print message confirming whether or not message was sent
        confirmSMS(payload);
      });
    }

    else if(row.length === 1){
      console.log("Sending message...");

      var payload = {
        to: row[0].contact_number,
        from: 'Contacto',
        message: message
      }
      //print message confirming whether or not message was sent
      confirmSMS(payload);
    }

    else{
      console.log("Message not sent because name does not exist in database")
    }
  });
}


//function to search database and optionally delete a contact from the database
function searchDB(query, search, searchNum, delete_contact){
  //check if you want to search for a name or number
  if(searchNum){
    field = "contact_number"
  }
  else{
    field = "contact_name"
  }

  db.all("SELECT contact_id, contact_name, contact_number FROM contacts WHERE " + field + " LIKE " + "'" + "%" + query + "%';", function(err, row){
    if(row.length > 1){
      var read = rl.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      //print members of array in a table
      for(i = 0; i < row.length; i++){
        table_search.push(
          [i, row[i].contact_name, row[i].contact_number]
        )
      }
      console.log(table_search.toString());
      

      read.question("\nWhich " + query + "? (Enter the corresponding option to indicate the contact) ", function(answer){
        read.close()
        answer = parseInt(answer); //convert the answer from string to integer

        if(search === true && delete_contact === false && searchNum === false){
          console.log("You chose " + row[answer].contact_name, row[answer].contact_number)
        }
        else if(search === false && delete_contact === false && searchNum === true){
          console.log("You chose " + row[answer].contact_name, row[answer].contact_number)
        }
        else if(delete_contact === true && search === false && searchNum === false){
          db.run("DELETE FROM contacts WHERE contact_name = " + "'" + row[answer].contact_name + "'")
          console.log(chalk.bold.green("Contact successfully deleted!!"));
        }
      });
    }
    else if(row.length === 1){
      if(search === true && delete_contact === false && searchNum === false){
        console.log("[" + row[0].contact_name + "]", row[0].contact_number);
      }
      else if(search === false && delete_contact === false && searchNum === true){
        console.log("[" + row[0].contact_name + "]", row[0].contact_number); 
      }
      else if(delete_contact === true && search === false && searchNum === false){
        db.run("DELETE FROM contacts WHERE contact_name = " +  "'" + row[0].contact_name + "'")
        console.log(chalk.bold.green("Contact successfully deleted!!"));
      }
    }
    else{
      console.log(chalk.bold.red("Contact not found!! Please check your search query"));
    }
  });
}

//Create a database to store the contacts
program
  .command('add <name> <phone_number>')
  .option('-n , --name','Name of the contact')
  .option('-p, --phone_number', 'Phone number of contact')
  .description('Add a new contact')
  .action(function(name, phone_number, command){
    //use regex to ensure that only numbers are entered for the phone number
    var pattern = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    if(pattern.exec(phone_number)){
      console.log("Please enter only numbers for the phone number");
    }
    else{
      //create the table if it does not exist
      db.serialize(function(){
        db.run("CREATE TABLE IF NOT EXISTS contacts (contact_id INTEGER PRIMARY KEY AUTOINCREMENT, contact_name TEXT NOT NULL, contact_number TEXT NOT NULL UNIQUE)");
      });

      var stmt = db.prepare("INSERT INTO contacts (contact_name, contact_number) VALUES (?, ?)");
      //add the name and phone number to the database
      stmt.run(name, phone_number)
      stmt.finalize();
      //print the data
      console.log(chalk.bold.green("Contact successfully created!!"))
    }
});


 //Search the database for a contact
 program
  .command('search <name>')
  .description('search for <name>')
  .action(function(name, command){
    db.serialize(function(){
      if(checkIfDBExists()){
        console.log(chalk.bold.red("Database table for contacts does not exist! Please add contacts before attempting to search"));
      }
      else{
        //call search function
        searchDB(name, search=true, searchNum = false, delete_contact=false);
      }
    });
});

//Search database using a number - or part of it
program
 .command('searchNum <number>')
 .description('Search database using <number>')
 .action(function(number, command){
  db.serialize(function(){
    //use a regular expression to ensure that the user entered only numbers
    var pattern = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    if(pattern.exec(number)){
      console.log("Please enter only numbers")
    }

    else if(checkIfDBExists()){
      console.log(chalk.bold.red("Database table for contacts does not exist! Please add contacts before attempting to search"));
    }
    else{
      searchDB(number, search=false, searchNum = true, delete_contact=false);
    }
  });
 });

//View all contacts
program
  .command('view')
  .description('View all stored contacts')
  .action(function(command){

    db.serialize(function(){
      db.get("SELECT * FROM sqlite_master WHERE type='table' AND name = 'contacts';", function(err, row){
        //check if the database table exists
        if(row === undefined){
          console.log(chalk.bold.red("No contacts to view because the contacts table does not exist"));
        }

        else{
          db.all("SELECT * FROM contacts ORDER BY contact_name;", function(err, row){
            //console.table('List of contacts', row)
            for(i = 0; i < row.length; i++){
              table.push(
                [row[i].contact_id, row[i].contact_name, row[i].contact_number]
              )
            }
            console.log(table.toString());
          });
        }
      });
    });
  });


//Delete a contact
program
  .command('del <name>')
  .description('Delete <name> from contacts')
  .action(function(name, command){

    db.serialize(function(){
      if(checkIfDBExists()){
        console.log(chalk.bold.red("Cannot delete contact because contacts table does not exist"));
      }

      else{
        searchDB(name, search=false, searchNum = false, delete_contact=true);
      }
    }); 
  });

//Send an SMS to another user in his contact list
program
  .command('text <name> <short_message>')
  .option('-m, --short_message', 'Message you want to send')
  .description('Send <short_message> to <name>')
  .action(function(short_message, name, command){

    db.serialize(function(){
      if(checkIfDBExists()){
        console.log(chalk.bold.red("Database table for contacts does not exist, please add contacts before attempting to send a message"));
      }
      else{
        sendSMS(name, short_message);
      }
  });
});

program.parse(process.argv)
