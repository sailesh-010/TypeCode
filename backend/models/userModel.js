const fs = require('fs');
const path = require('path');

// Basic file-based user model
class UserModel {
  constructor() {
    this.dataFile = path.join(__dirname, '..', 'data', 'users.json');
    this.users = [];
    this.id = 1;
    this.init();
  }

  init() {
    // Make sure data directory exists
    const dir = path.dirname(this.dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing data if possible
    if (fs.existsSync(this.dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.users = data.users || [];
        this.id = data.nextId || 1;
      } catch (err) {
        console.error('Error reading users.json:', err);
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify({
        users: this.users,
        nextId: this.id
      }, null, 2));
    } catch (err) {
      console.error('Error saving users.json:', err);
    }
  }

  /**
   * Create a new user
   */
  create(userData) {
    const user = {
      id: this.id++,
      ...userData,
      statistics: {
        bestWPM: 0,
        averageWPM: 0,
        totalTests: 0,
        averageAccuracy: 0,
        lastTestDate: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    this.save();
    return user;
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Find user by ID
   */
  findById(id) {
    const user = this.users.find(u => u.id === id);
    // Ensure backward compatibility - add statistics field if missing
    if (user && !user.statistics) {
      user.statistics = {
        bestWPM: 0,
        averageWPM: 0,
        totalTests: 0,
        averageAccuracy: 0,
        lastTestDate: null
      };
    }
    return user;
  }

  /**
   * Find all users
   */
  findAll() {
    return this.users;
  }

  /**
   * Update user
   */
  update(id, updateData) {
    const user = this.findById(id);
    if (user) {
      Object.assign(user, updateData, { updatedAt: new Date() });
      this.save();
    }
    return user;
  }

  /**
   * Update user statistics
   * @param {number} userId - User ID
   * @param {Object} statistics - Statistics object with bestWPM, averageWPM, totalTests, averageAccuracy, lastTestDate
   * @returns {Object} Updated user or null if not found
   */
  updateStatistics(userId, statistics) {
    const user = this.findById(userId);
    if (!user) {
      return null;
    }

    // Ensure statistics object exists
    if (!user.statistics) {
      user.statistics = {
        bestWPM: 0,
        averageWPM: 0,
        totalTests: 0,
        averageAccuracy: 0,
        lastTestDate: null
      };
    }

    // Update statistics fields
    Object.assign(user.statistics, statistics);
    user.updatedAt = new Date();
    this.save();
    return user;
  }

  /**
   * Delete user
   */
  delete(id) {
    this.users = this.users.filter(u => u.id !== id);
    this.save();
    return true;
  }
}

module.exports = new UserModel();
