class UserBO {
    static async authenticate(userDTO) {
        try {
            const user = await UserDAO.verifyCredentials(
                userDTO.getUsername(), 
                userDTO.getPassword()
            );
            if (user) {
                DataStore.setActiveUser(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Authentication Error:", error);
            return false;
        }
    }

    static async resetPassword(username, newPassword) {
        return await UserDAO.updatePassword(username, newPassword);
    }

    static logout() {
        try {
            DataStore.clearActiveUser();
            return true;
        } catch (error) {
            console.error("Logout Error:", error);
            return false;
        }
    }
}
