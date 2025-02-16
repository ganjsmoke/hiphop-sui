const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

// Configure chalk theme
const success = chalk.green.bold;
const error = chalk.red.bold;
const warning = chalk.yellow.bold;
const info = chalk.cyan.bold;
const taskColor = chalk.hex('#FFA500');

// Global counters
let totalRuns = 0;
let totalAccounts = 0;
let tasksCompleted = 0;

// Read accounts from file
const readAccounts = () => {
    try {
        return fs.readFileSync('cookies.txt', 'utf-8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const cookies = line.split(';').reduce((acc, cookie) => {
                    const [name, value] = cookie.split('=').map(s => s.trim());
                    if (name && value) acc[name] = value;
                    return acc;
                }, {});
                return {
                    xAuthAccess: cookies['x-auth-access'],
                    xAuthRefresh: cookies['x-auth-refresh']
                };
            });
    } catch (err) {
        console.log(error('❌ Error reading cookies.txt:', err.message));
        process.exit(1);
    }
};

// Create axios instance for account
const createApi = (account) => {
    return axios.create({
        baseURL: 'https://quests-api.hiphop.fun/api/v1',
        headers: {
            'Cookie': `x-auth-access=${account.xAuthAccess}; x-auth-refresh=${account.xAuthRefresh}`
        }
    });
};

// Get Twitter username for account
const getTwitterUsername = async (api) => {
    try {
        const { data } = await api.get('/users');
        return data.data.attributes.twitter.userName;
    } catch (err) {
        console.log(error('❌ Failed to get user info:', err.response?.data?.message || err.message));
        throw err;
    }
};

// Process single account
const processAccount = async (account, accountIndex) => {
    const api = createApi(account);
    
    try {
        const username = await getTwitterUsername(api);
        console.log(info(`\n👤 Account ${accountIndex + 1}/${totalAccounts}: ${chalk.bold(`@${username}`)}`));

        const [allTasks, completedTaskIds] = await Promise.all([
            api.get('/tasks').then(r => r.data.data),
            api.get('/tasks/users').then(r => r.data.data.map(t => t.task_id))
        ]);

        const incompleteTasks = allTasks.filter(
            task => !completedTaskIds.includes(task.id) && task.is_manual
        );

        if (incompleteTasks.length === 0) {
            console.log(warning('   ✨ All tasks already completed!'));
            return 0;
        }

        console.log(info(`   🔄 Found ${incompleteTasks.length} incomplete tasks`));
        
        let accountTasksCompleted = 0;
        for (const [index, task] of incompleteTasks.entries()) {
            console.log(taskColor(`\n   📝 Processing task ${index + 1} of ${incompleteTasks.length}`));
            console.log(taskColor(`   🛠  ${task.title} (ID: ${task.id})`));
            
            try {
                const result = await api.post('/tasks/do-manually', { taskId: task.id });
                if (result.data.data.isSuccess) {
                    accountTasksCompleted++;
                    tasksCompleted++;
                    console.log(success('   ✓ Completed'));
                } else {
                    console.log(error('   ✗ Failed'));
                }
            } catch (err) {
                console.log(error(`   ❌ Error: ${err.response?.data?.message || err.message}`));
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return accountTasksCompleted;
    } catch (err) {
        console.log(error(`   💥 Account processing failed: ${err.message}`));
        return 0;
    }
};

// Main processing loop
const runAllAccounts = async () => {
    const accounts = readAccounts();
    totalAccounts = accounts.length;
    
    console.log(info(`\n📚 Found ${totalAccounts} accounts`));
    
    for (const [index, account] of accounts.entries()) {
        const accountNumber = index + 1;
        console.log(info(`\n🏁 Processing account ${accountNumber}/${totalAccounts}`));
        
        const startTime = Date.now();
        const accountTasks = await processAccount(account, index);
        const duration = Math.round((Date.now() - startTime) / 1000);
        
        console.log(info(`\n   ⏱  Completed ${accountTasks} tasks in ${duration}s`));
        console.log(info(`   🔄 Total completed tasks: ${tasksCompleted}`));
        
        if (accountNumber < accounts.length) {
            console.log(info('\n----------------------------------------'));
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

// Continuous execution
const startLoop = async () => {
    console.log(chalk.magenta.bold('\n🚀 Starting HIPPO Multi-Account Automator\n'));
    
    const loop = async () => {
        totalRuns++;
        console.log(info(`\n🏃 Run #${totalRuns} started at ${new Date().toLocaleString()}`));
        
        await runAllAccounts();
        
        const nextRun = new Date(Date.now() + 12 * 60 * 60 * 1000);
        console.log(info(`\n⏳ Next run at: ${nextRun.toLocaleString()}`));
        console.log(info(`📈 Total tasks completed: ${tasksCompleted}`));
        
        setTimeout(loop, 12 * 60 * 60 * 1000);
    };

    await loop();
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(info('\n🛑 Script stopped by user'));
    console.log(info(`📊 Total runs completed: ${totalRuns}`));
    console.log(info(`🏆 Total tasks completed: ${tasksCompleted}`));
    process.exit();
});

// Start the process
startLoop();
