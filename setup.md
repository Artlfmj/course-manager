# Project Setup

This guide will help you set up the project on your local machine.

## Step 1: Install Dependencies

First, you need to install the project dependencies. Run the following command in your terminal:

```bash
npm install
```

## Step 2: Set Up Environment Variables

There is an example.env.txt file in the project root. Create a new file named .env in the same location and copy the contents of example.env.txt into it.

In the .env file, you will find a placeholder for MONGODB_URL credential. Replace it with your actual credentials.

If you’re running MongoDB locally, your database link will look something like this:

```bash
mongodb://localhost:27017/mydatabase
```

If you’re using a cloud database service like MongoDB Atlas, your database link will be provided by the service.which will look something like this:

- replace the password with actual password

```bash
mongodb+srv://databasename:<password>@something.banc821.mongodb.net/
```

## Step 3: Start the Server

To start the server, run the following command:

```bash
npm run dev
```

Now, your server should be up and running!

## Step 4: Access the Server

You can access the server by typing http://localhost:<port_number> in your browser, where <port_number> is the port number on which your server is running. the default port is 3000:

```bash
 http://localhost:3000
```
