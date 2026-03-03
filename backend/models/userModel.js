// Mock user model (can be replaced with MongoDB/Mongoose)
class UserModel {
  constructor() {
    this.users = [];
    this.id = 1;
  }

  /**
   * Create a new user
   */
  create(userData) {
    const user = {
      id: this.id++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  /**
   * Find user by ID
   */
  findById(id) {
    return this.users.find(u => u.id === id);
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
    }
    return user;
  }

  /**
   * Delete user
   */
  delete(id) {
    this.users = this.users.filter(u => u.id !== id);
    return true;
  }
}

module.exports = new UserModel();
