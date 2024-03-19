module.exports = {
    apps: [{
        name: 's06',
        script: 'index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        error_file: 'err.log',
        out_file: 'out.log',
        log_file: 'combined.log',
        time: true
    }]
}
