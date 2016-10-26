# Contacto

## Introduction

- **Contacto** is a node.js powered console application for managing contacts. 
- It has the following features:
  - Adding a contact
  - Searching for a contact
  - View all stored contacts
  - Delete a contact
  - Send an SMS to people in contacts


## Dependencies

- This app's functionality depends on the following node.js modules:
  - **sqlite3** - This module was used to create the database used to store the contacts.
  - **commander** - This is a module for parsing the commands passed to the console application.
  - **jusibe** - This is a Javascript client for the [jusibe.com](http://jusibe.com) SMS API service.
  - **readline** -  The readline module provides an interface for reading data from a Readable stream (such as process.stdin) one line at a time.

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
       > `add -n <name> -p <phone_number>`
- To search for a contact use the following command
       > `search <name>`
- To view all stored contacts
       > `view`

- To delete a contact
       > `del <name>` 

- To send an SMS to a contact
       > `text <name> -m <short_message>`

