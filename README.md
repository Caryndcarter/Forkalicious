<!-- prettier-ignore -->
# Welcome to Forkalicious! 🍽️

![OpenAI](https://img.shields.io/badge/ChatGPT-Integration-%2316A180?logo=openai) ![MongoDB](https://img.shields.io/badge/MongoDB-%23429E47?logo=mongoDB&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-%23880000?logo=Mongoose&logoColor=white) ![GraphQL](https://img.shields.io/badge/GraphQL-%23F25CC0?logo=graphql) ![React](https://img.shields.io/badge/React-%2361DAFB?logo=react&logoColor=white) ![Express](https://img.shields.io/badge/Express-%23F0D951?logo=express&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-%232D79C7?logo=typescript&logoColor=white)

## Running with Docker

it's very simple to generate a docker image and run it, or run the tests.

1. Make all .sh files executable: ```chmod +x *.sh```

2. Use the executable to build the docker image: ```./build_docker.sh```

3. Create your .env file (see instructions below)

4. Run your container from the image: ```./run_docker.sh```

5. Run tests: ```./run_tests```

## Creating an .env file
In order to run this application, you'll need to create an `.env` file like the `.env.example` shown. Follow these steps and fill in the `.env` file with valid values. the Open AI API key will require you to buy some tokens to run correctly. Use the .env values with the docker command shown below.

### Generate your Spoonacular API key

1.  **Generate a Spoonacular API Key**
    * Navigate to the [Spoonacular Food API Console](https://spoonacular.com/food-api/console#Dashboard).
    * Sign up for a new account (or log in if you already have one).
    * Follow the instructions on the dashboard to generate your API key.
    * **Important:** Paste it into the `SPOONACULAR_API_KEY` value in the `.env` file.

### Generate your MongoDB URI

1.  **Set Up Your MongoDB Atlas Account and Cluster**
    * Navigate to the [MongoDB Atlas website](https://account.mongodb.com/account/login).
    * Sign up for a new account (or log in if you already have one).
    * Follow the prompts to create a new **free-tier** cluster.

2.  **Configure Database Access**
    * Once your cluster is created, go to the `Database Access` section in the left-hand navigation pane.
    * Ensure you have an admin user set up. If not, click `Add New Database User` to create one.
    * **Important:** Note down the username and password for this admin user. You will need them later for your connection string.

3.  **Configure Network Access**
    * In the left-hand navigation pane, go to `Network Access`.
    * Click `Add IP Address`.
    * Select `Add Current IP Address` to allow connections from your machine. Confirm the addition.

4.  **Create Your Database and Collections**
    * Go back to the `Clusters` overview page.
    * Click on the `Browse Collections` button for your cluster.
    * Click `Add My Own Data` (or `Create Database` if it's your first time).
    * Enter a name for your new database (e.g., `tutorialDB` or `recipeApp`).
    * Create a collection called `recipes`.
    * Repeat the process to create two more collections within the *same database*: `reviews` and `users`.

5.  **Obtain and Customize Your Connection URI**
    * Return to the `Clusters` overview page.
    * Click the `Connect` button for your cluster.
    * Select `Connect your application`.
    * Under `Choose your driver version`, select `Node.js` and `6.7 or later`.
    * Copy the connection string (URI) that is generated.
    * Paste this URI into a text editor and fill in the blanks (`<USERNAME>`, `<PASSWORD>`, and `<DATABASE NAME>`) using the credentials you noted earlier and the database name you created.
    * Your final URI should look similar to this example: `mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mlhsd.mongodb.net/<DATABASE NAME>?retryWrites=true&w=majority&appName=cluster0`

### Generate your Open AI API key

1.  **Navigate to the OpenAI Platform**
    * Open your web browser and go to the official [OpenAI Platform website](https://platform.openai.com/). This is the central hub for managing your OpenAI API access, usage, and billing.

2.  **Sign Up or Log In to Your Account**
    * If you don't have an OpenAI account, click the "**Sign Up**" button.
    * If you already have an account, simply click "**Log In**" and enter your credentials.

3.  **Access the API Keys Section**
    * Once you're successfully logged in, select `dashboard` in the top navbar.
    * From the left menu, select the option labeled "**API keys**" or "**View API keys**". This will take you to a dedicated page where all your existing API keys are listed and new ones can be generated.

4.  **Create a New Secret Key**
    * On the API keys page, you'll see a button, typically labeled `+ Create new secret key` or similar. Click this button to initiate the key generation process.
    * A pop-up window or form might appear, asking you to name your key (e.g., "MyTutorialAppKey"). Giving it a descriptive name can help you identify its purpose later, especially if you create multiple keys.
    * You might also see options for setting permissions or associating the key with a specific project if your account is part of an organization. Make sure that this key is enabled to use the `gpt-4o-mini` model.

5.  **Copy and Secure Your API Key**
    * After clicking "**Create secret key**", your brand-new API key will be generated and displayed ***only once*** on the screen.
    * **CRITICAL:** Immediately copy this entire key string. There will typically be a "Copy" button next to it.
    * **Do not close this window or navigate away until you have copied the key.** For security reasons, OpenAI doesn't allow you to view the full key again after this initial display. If you lose it, you'll have to revoke it and generate a new one.
    * Paste the copied key into the `.env` file.

6.  **Set Up Billing and Usage Limits**
    * OpenAI API usage isn't free. To ensure uninterrupted access, navigate to the "**Billing**" section (usually in the left-hand menu) to add a payment method.
    * Buy a very small number of tokens to make sure the API key can be used in this app.

## Running from the image:

The `-p` value is the port. You can change this to whichever port you want, but make sure it matches the one in your .env file.

```sh
sudo docker run -p 3001:3001 my-app:latest
```