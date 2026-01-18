module.exports = {
    apps: [
        {
            name: 'backend',
            cwd: '/opt/uottahack-8/backend',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 4000
            }
        },
        {
            name: 'frontend',
            cwd: '/opt/uottahack-8/frontend/cuely',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
