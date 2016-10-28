# Contacto

## Introduction

- **Contacto** is a node.js console application for managing contacts. 
- It has the following features:
  - Adding a contact.
  - Searching for a contact (using either a name or number).
  - View all stored contacts.
  - Delete a contact.
  - Send an SMS to a person in your contacts.


## Dependencies

- This app's functionality depends on the following node.js modules:
  - **sqlite3** - This module was used to create the database used to store the contacts.
  - **commander** - This is a module for parsing the commands passed to the console application.
  - **jusibe** - This is a Javascript client for the [jusibe.com](http://jusibe.com) SMS API service.
  - **readline** -  The readline module provides an interface for reading data from a Readable stream (such as process.stdin) one line at a time.
  - **chalk** - This is a module helps to style strings printed on the console.
  - **console.table** - Used to print array of objects as a table in the console.
  - **cli-table** - This utility allows you to render unicode-aided tables on the command line from your node.js scripts.
  - **dotenv** - Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env

## Installation and Setup

- Navigate to the directory of choice on your terminal.
- Clone this repository in that directory.
  - Using SSH 
        > git@github.com:RotimiBabalola/bc-19-Contacts-Manager-SMS.git
      
  - Using HTTP
        > https://github.com/RotimiBabalola/bc-19-Contacts-Manager-SMS.git

- Navigate to the repo's folder on your computer
  - `cd bc-19-Contacts-Manager-SMS/`

- Install the dependencies stated above using **npm**. 
- You will also need to have **node** and **git** installed on your system.

##Using the application

- To add a contact use the following command        
       `add -n <name> -p <phone_number>`
- To search for a contact use the following command
       `search <name>`
- To search for a contact using a number 
       `searchNum <number>`
- To view all stored contacts
       `view`
- To delete a contact
       `del <name>` 
- To send an SMS to a contact
       `text <name> -m <short_message>` 

