# DoNation


DoNation is an online platform where person can donate their goods and the person in need can get that easily. Users can also post their requirements.

## Features

- Users can post their items for donation and other users can get that who are in need.
- If a user requires something, they can post a requirement for that.
- Directly chat with the owner.
- If someone wants to raise a hand on a posted donation item, they can easily do that.

## Link to other Repos related to Kolegia

1. [DoNation Frontend](https://github.com/thebeast1819/DoNation.git)

## Development Setup

To set up DoNation for development, you need to install the following dependencies:

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

    git clone https://github.com/thebeast1819/Donation_Backend.git

### Step 6: Install dependencies

    cd Donation_Backend

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
donateditems=""
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
