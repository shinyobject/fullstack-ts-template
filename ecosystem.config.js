module.exports = {
  apps: [
    {
      name: 'todo-app',
      script: './server/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      time: true,
    },
    {
      name: 'cloudflare-tunnel',
      script: '/usr/local/bin/cloudflared',
      args: 'tunnel run todo-app',
      autorestart: true,
      watch: false,
      error_file: './logs/tunnel-error.log',
      out_file: './logs/tunnel-out.log',
      time: true,
    },
  ],
};
