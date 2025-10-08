// Test controller for basic endpoint testing

const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Test endpoint is working',
        timestamp: new Date().toISOString()
    });
};

const greeter = (req, res) => {
    const { name } = req.body;
    
    if (name) {
        res.status(200).json({
            message: `Hello, ${name}!`,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(200).json({
            message: 'Hello, World!',
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    healthCheck,
    greeter
};
