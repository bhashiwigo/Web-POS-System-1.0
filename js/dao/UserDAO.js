class UserDAO {
    // Simulated database query
    static async verifyCredentials(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = DataStore.getUsers();
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    resolve(user); // Return user object instead of true
                } else {
                    resolve(null);
                }
            }, 300);
        });
    }
    
    static async updatePassword(username, newPassword) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = DataStore.getUsers();
                const userIndex = users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    users[userIndex].password = newPassword;
                    DataStore.saveUsers(users);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 300);
        });
    }
}
