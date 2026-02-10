// controllers/sessionController.js
const Session = require('../models/Session');
const Streak = require('../models/Streak');
const Resource = require('../models/Resource');

// Start a new session
exports.startSession = async (req, res) => {
  try {
    const { resourceId } = req.body;
    
    // Check if there's already an active session
    const activeSession = await Session.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });
    
    if (activeSession) {
      return res.status(400).json({ 
        message: 'You already have an active session' 
      });
    }

    const session = new Session({
      userId: req.user.id,
      resourceId,
      startTime: new Date(),
      date: new Date().setHours(0, 0, 0, 0),
      isActive: true
    });

    await session.save();
    await session.populate('resourceId', 'name icon');

    res.status(201).json({ 
      message: 'Session started successfully', 
      session 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End active session
exports.endSession = async (req, res) => {
  try {
    const { sessionId, activityDetails } = req.body;
    
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user.id,
      isActive: true 
    });

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 60000); // minutes

    session.endTime = endTime;
    session.duration = duration;
    session.activityDetails = activityDetails;
    session.isActive = false;

    await session.save();

    // Update streak
    await updateStreak(req.user.id, session.resourceId);

    await session.populate('resourceId', 'name icon');

    res.json({ 
      message: 'Session ended successfully', 
      session 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active session
exports.getActiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      userId: req.user.id, 
      isActive: true 
    }).populate('resourceId', 'name icon');

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sessions with filters
exports.getSessions = async (req, res) => {
  try {
    const { period, resourceId, limit = 50 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      dateFilter = { 
        date: new Date().setHours(0, 0, 0, 0) 
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { 
        date: { $gte: weekAgo.setHours(0, 0, 0, 0) } 
      };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { 
        date: { $gte: monthAgo.setHours(0, 0, 0, 0) } 
      };
    }

    const query = { 
      userId: req.user.id,
      isActive: false,
      ...dateFilter
    };

    if (resourceId) {
      query.resourceId = resourceId;
    }

    const sessions = await Session.find(query)
      .populate('resourceId', 'name icon category')
      .sort({ startTime: -1 })
      .limit(parseInt(limit));

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      dateFilter = new Date().setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = weekAgo.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = monthAgo.setHours(0, 0, 0, 0);
    }

    const sessions = await Session.find({ 
      userId: req.user.id,
      isActive: false,
      date: { $gte: dateFilter }
    }).populate('resourceId', 'name category');

    // Calculate analytics
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalProblems = sessions.reduce((sum, s) => 
      sum + (s.activityDetails?.problemsSolved || 0), 0
    );

    // Time by resource
    const resourceStats = {};
    sessions.forEach(s => {
      const resName = s.resourceId?.name || 'Unknown';
      if (!resourceStats[resName]) {
        resourceStats[resName] = { 
          time: 0, 
          sessions: 0,
          problems: 0
        };
      }
      resourceStats[resName].time += s.duration || 0;
      resourceStats[resName].sessions += 1;
      resourceStats[resName].problems += s.activityDetails?.problemsSolved || 0;
    });

    // Daily breakdown
    const dailyStats = {};
    sessions.forEach(s => {
      const date = new Date(s.date).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { time: 0, sessions: 0, problems: 0 };
      }
      dailyStats[date].time += s.duration || 0;
      dailyStats[date].sessions += 1;
      dailyStats[date].problems += s.activityDetails?.problemsSolved || 0;
    });

    res.json({
      totalTime,
      totalProblems,
      totalSessions: sessions.length,
      averageSessionTime: sessions.length > 0 ? totalTime / sessions.length : 0,
      resourceStats,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update streak
async function updateStreak(userId, resourceId) {
  try {
    let streak = await Streak.findOne({ userId });
    
    if (!streak) {
      streak = new Streak({ userId });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000);
    const lastActive = streak.lastActiveDate ? 
      new Date(streak.lastActiveDate).setHours(0, 0, 0, 0) : null;

    if (!lastActive || lastActive < yesterday) {
      // Streak broken, reset
      streak.currentStreak = 1;
    } else if (lastActive === yesterday) {
      // Continue streak
      streak.currentStreak += 1;
    }
    // If lastActive === today, don't increment (already counted)

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = new Date();
    streak.totalSessionDays += 1;

    // Update resource-specific streak
    const resIndex = streak.resourceStreaks.findIndex(
      r => r.resourceId.toString() === resourceId.toString()
    );

    if (resIndex !== -1) {
      const resLastActive = streak.resourceStreaks[resIndex].lastActive ?
        new Date(streak.resourceStreaks[resIndex].lastActive).setHours(0, 0, 0, 0) : null;
      
      if (!resLastActive || resLastActive < yesterday) {
        streak.resourceStreaks[resIndex].streak = 1;
      } else if (resLastActive === yesterday) {
        streak.resourceStreaks[resIndex].streak += 1;
      }
      streak.resourceStreaks[resIndex].lastActive = new Date();
    } else {
      streak.resourceStreaks.push({
        resourceId,
        streak: 1,
        lastActive: new Date()
      });
    }

    await streak.save();
  } catch (error) {
    console.error('Streak update error:', error);
  }
}

module.exports = exports;