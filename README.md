# Kolegia

<p align="center">
  <img width="500" src="https://i.imgur.com/8NsQdLA.png" />
</p>

Kolegia is a platform where users can post their lost items and find them. Users can also sell their items by posting them.

## Features

- Users can post their lost items and other users can help them find it.
- Users can also sell something, by posting it on the platform.
- If a user requires something, they can post a requirement for that.
- Directly chat with the seller of the product for buying any item.
- If someone wants to raise a hand on a lost item, they can easily do that.
- Light/Dark Mode support.

## Link to other Repos related to Kolegia

1. [Frontend Web application](https://github.com/adarsharyan002/Kolegia_FrontEnd) 
2. [Mobile Application](https://github.com/kartikeyvaish/Kolegia_Mobile)

## Development Setup

To set up Kolegia for development, you need to install the following dependencies:

- Install [Node](https://nodejs.org/en/)
- Install [MongoDB](https://www.mongodb.com/download-center/community)
- Create a `.env` file for environment variables

Follow these steps to set up the development environment:

### Step 1: Install Node.js from the [Node.js official website](https://nodejs.org/en/).

During the developement process, I used node version v14.17.4. You can check your node version by running the following command:

```shell
node -v
```

### Step 2: Install MongoDB from the [MongoDB official website](https://www.mongodb.com/download-center/community).

My MongoDB shell version `v5.0.2-rc0`

### Step 3: Install [MongoDB Compass](https://www.mongodb.com/products/compass) and [Postman](https://www.postman.com/) (Optional)

You may want to install these two tools to help you with the development process.
Using MongoDB Compass, you can have a look at your database as it gives a nice overview of your database.
Postman can be used to test API endpoints.

### Step 4: Create a `.env` file for environment variables

You'll have to create a `.env` file for environment variables with the variables listed [here](https://github.com/kartikeyvaish/Kolegia-Backend/blob/main/README.md#env-file)

### Step 5: Clone the repository

    git clone https://github.com/kartikeyvaish/Kolegia-Backend.git

### Step 6: Install dependencies

    cd Kolegia-Backend

    npm install

### Step 7: Run the server

    npm run dev

#### .env file

```dosini
NODE_ENV=""

host=""
DB_PORT=
DB_Name=""

prod_atlas_url=""
dev_atlas_url=""
prod_compassURL=""
dev_compassURL=""

JWT_Key=""
apiVersion=""

default_channel_id=""
default_profile_picture=""
default_product_image=""

auth=""
requirements=""
raisedhands=""
chats=""
otp=""
buysell=""
lostfound=""
feedback=""

CLOUDINARY_URL=""
CLOUDINARY_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

projectId=""
clientEmail=""
privateKey=""

googleApiClientID=""
googleApiClientID_Mobile=""

google_app_password=""
google_admin_email=""
```
