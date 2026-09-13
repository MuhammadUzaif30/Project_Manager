const { io } = require("socket.io-client");

// You will change these two variables during testing
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWE1MWYxZWY3YzA2ZmI5OTZlOTU0NTEiLCJpYXQiOjE3ODkyMDYzMDIsImV4cCI6MTc4OTgxMTEwMn0.9DEtgTBU6IhrjYtNllvzl5SYT095OFLkUKGhu5SzZHg"; 
const PROJECT_ID = "6aa521fbf7c06fb996e95458";

console.log("Attempting to connect...");

const socket = io("http://localhost:5000", {
  auth: { token: TOKEN } // <-- Removed the "Bearer " part
});

// SUCCESS LISTENER
socket.on("connect", () => {
  console.log(` Connected! My Socket ID is: ${socket.id}`);
  socket.emit("joinProject", PROJECT_ID);
});

// ERROR LISTENER (This will tell us why it's failing)
socket.on("connect_error", (err) => {
  console.error(" CONNECTION REJECTED BY SERVER:", err.message);
});

socket.on("issue:created", (issue) => {
  console.log(" NEW ISSUE CREATED ->", issue.title);
});

socket.on("issue:updated", (issue) => {
  console.log(" ISSUE UPDATED -> Status:", issue.status);
});