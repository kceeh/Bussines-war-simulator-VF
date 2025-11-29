const User = require('../models/User');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserStats = async (req, res) => {
    try {
        const { gamesPlayed, gamesWon, bestCapital, bestMarketShare } = req.body;
        
        const updateFields = {};
        if (gamesPlayed) updateFields['$inc'] = { 'stats.gamesPlayed': gamesPlayed };
        if (gamesWon) updateFields['$inc'] = { ...updateFields['$inc'], 'stats.gamesWon': gamesWon };
        if (bestCapital) updateFields['$max'] = { 'stats.bestCapital': bestCapital };
        if (bestMarketShare) updateFields['$max'] = { 'stats.bestMarketShare': bestMarketShare };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true }
        ).select('-password');
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserStats
};