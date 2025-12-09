// Authentication state management
const USER_SESSION_KEY = 'aether_user_session';
const USER_PROFILE_KEY = 'aether_user_profile';
const USERS_KEY = 'aether_users';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Get all users (for demo purposes)
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

// Save users (for demo purposes)
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Check if user is logged in
function isUserLoggedIn() {
    // Check both localStorage and sessionStorage for a valid session
    let session = JSON.parse(localStorage.getItem(USER_SESSION_KEY) || '{}');
    
    // If no session in localStorage, check sessionStorage
    if (!session.token) {
        session = JSON.parse(sessionStorage.getItem(USER_SESSION_KEY) || '{}');
    }
    
    // Check if session exists and is not expired
    if (session.token) {
        // Check session timeout
        if (session.lastActivity && (Date.now() - session.lastActivity > SESSION_TIMEOUT)) {
            logoutUser(false);
            return false;
        }
        // Update last activity time
        session.lastActivity = Date.now();
        const storage = session.rememberMe ? localStorage : sessionStorage;
        storage.setItem(USER_SESSION_KEY, JSON.stringify(session));
        return true;
    }
    return false;
}

// Get user profile
function getUserProfile() {
    const profile = localStorage.getItem(USER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
}

// Check if user has complete profile
function hasCompleteProfile() {
    const profile = getUserProfile();
    return profile && 
           profile.name && 
           profile.phone && 
           profile.address && 
           profile.address.line1 && 
           profile.address.city && 
           profile.address.state && 
           profile.address.pincode;
}

// Login function
function loginUser(email, password, rememberMe = false) {
    // In a real app, this would be an API call to your backend
    const users = getUsers();
    const user = users[email];
    
    if (user && user.password === password) {
        const session = { 
            email: user.email, 
            userId: user.id,
            token: 'demo-token-' + Date.now(),
            lastActivity: Date.now(),
            rememberMe: rememberMe
        };
        
        // If remember me is checked, store in localStorage, otherwise use sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(USER_SESSION_KEY, JSON.stringify(session));
        
        // Load user profile if exists
        const profile = getUserProfile();
        if (!profile) {
            // Initialize profile with basic info
            saveUserProfile({
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: {}
            });
        }
        
        return true;
    }
    return false;
}

// Signup function
function signupUser(userData) {
    const users = getUsers();
    
    // Check if user already exists
    if (users[userData.email]) {
        return false;
    }
    
    // Store user (in a real app, this would be an API call)
    users[userData.email] = {
        id: 'user-' + Date.now(),
        email: userData.email,
        password: userData.password, // In a real app, passwords should be hashed
        name: userData.name,
        phone: userData.phone,
        createdAt: new Date().toISOString()
    };
    
    saveUsers(users);
    
    // Auto-login after signup
    return loginUser(userData.email, userData.password);
}

// Logout function
function logoutUser(redirect = true) {
    // Clear from both storage locations to be safe
    localStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    
    if (redirect && window.location.pathname !== '/') {
        window.location.href = '/';
    }
}

// Save user profile
function saveUserProfile(profile) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

// Check if user can place order
function canPlaceOrder() {
    return isUserLoggedIn() && hasCompleteProfile();
}

// Redirect to profile if not complete
function ensureProfileComplete(redirectUrl = '/profile.html') {
    if (!isUserLoggedIn()) {
        // Store intended URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login.html';
        return false;
    }
    if (!hasCompleteProfile()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Initialize test users if they don't exist
function initializeTestUsers() {
    const users = getUsers();
    const testEmail = 'test@gmail.com';
    
    if (!users[testEmail]) {
        users[testEmail] = {
            id: 'test-user-123',
            email: testEmail,
            password: 'abcdef', // In a real app, passwords should be hashed
            name: 'Test User',
            phone: '9876543210',
            createdAt: new Date().toISOString()
        };
        saveUsers(users);
    }
}

// Initialize test users when the script loads
initializeTestUsers();

// Export functions
window.Auth = {
    isUserLoggedIn,
    getUserProfile,
    hasCompleteProfile,
    loginUser,
    logoutUser,
    signupUser,
    saveUserProfile,
    canPlaceOrder,
    ensureProfileComplete
};
