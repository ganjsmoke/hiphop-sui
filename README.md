# HIPPO Multi-Account Automator

This script automates the process of completing manual tasks for multiple accounts on the HIPPO platform.

Register : https://quests.hiphop.fun/?referralCode=138d51
Reff Code : 138d51

## Features
- Supports processing multiple accounts concurrently.
- Reads account information from a `cookies.txt` file containing cookies for each account.
- Automatically performs available manual tasks for each account.
- Handles account failures gracefully and retries tasks.
- The script runs continuously, processing accounts every 12 hours.
- Provides detailed logging with status updates and progress tracking.

## Prerequisites

Before running the script, ensure that you have the following:

- [Node.js](https://nodejs.org/) version 14.x or higher installed.
- A valid `cookies.txt` file containing the cookies for the accounts you wish to automate tasks for. This file should be in the same directory as the script.

## Setup Instructions

### 1. Clone the Repository

Clone this repository to your local machine using Git:

```bash
git clone https://github.com/ganjsmoke/hiphop-sui.git
cd hiphop-sui
```

### 2. Install Dependencies

Install the required dependencies using npm:

```bash
npm install chalk@2 axios
```

### 3. Prepare cookies.txt

Create a cookies.txt file in the project directory. The file should contain cookies for each account in the following format:

```
x-auth-access=<access_token_1>; x-auth-refresh=<refresh_token_1>
x-auth-access=<access_token_2>; x-auth-refresh=<refresh_token_2>
...
```
![image](https://github.com/user-attachments/assets/9e9ecb1e-9bbd-44e4-8502-6ce930cc2878)

Each line in the cookies.txt file should correspond to one account, containing the x-auth-access and x-auth-refresh tokens.

### 4. Run the Script

Start the script with the following command:

```bash
node index.js
```

The script will start processing the accounts, performing available tasks, and logging the progress. It will continue running and process accounts every 12 hours.
