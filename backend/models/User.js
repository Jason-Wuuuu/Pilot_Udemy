export default class User {
  constructor({ userId, username, email, passwordHash }) {
    this.PK = `USER#${userId}`;
    this.SK = "PROFILE";
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;

    this.role = "STUDENT";
    this.status = "ACTIVE";
    this.createdAt = new Date().toISOString();
  }
}
