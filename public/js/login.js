// login.js

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error(`Server did not return JSON. Status: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(data.message || `Login failed (Status ${response.status})`);
        }

        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user.id);

        // Redirect based on role
        redirectToDashboard(data.user.role);

    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
});

// Toggle password visibility
document.getElementById('togglePasswordLogin').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    document.getElementById('togglePasswordLogin').textContent = type === 'password' ? '👁️' : '🙈';
});

// Redirect user based on role
function redirectToDashboard(role) {
    switch ((role || '').toLowerCase()) {
        case 'admin':
        case 'student':
        case 'staff':
            window.location.href = 'dashboard.html';
            break;
        default:
            alert('Unknown role. Please contact support.');
            window.location.href = '/login.html';
    }
}
