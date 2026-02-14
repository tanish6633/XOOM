const axios = require('axios');

async function testAuth() {
    const url = 'http://localhost:3000/api/auth';

    // 1. Try to Signup
    console.log("--- Attempting Signup ---");
    const testUser = {
        username: "testuser_" + Date.now(),
        email: "test_" + Date.now() + "@example.com",
        password: "password123"
    };

    try {
        const res = await axios.post(`${url}/signup`, testUser);
        console.log("Signup Response:", res.status, res.data);
    } catch (e) {
        console.log("Signup Failed:", e.response ? e.response.data : e.message);
    }

    // 2. Try to Signin
    console.log("\n--- Attempting Signin ---");
    try {
        const res = await axios.post(`${url}/signin`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log("Signin Response:", res.status, res.data);
    } catch (e) {
        console.log("Signin Failed:", e.response ? e.response.status : "No Status");
        console.log("Error Data:", e.response ? e.response.data : e.message);
    }
}

testAuth();
