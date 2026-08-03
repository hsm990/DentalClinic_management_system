const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc2R0YmNydTAwMDE2NHZ2aHcxOWlyNzQiLCJyb2xlIjoiQURNSU4iLCJjbGluaWNJZCI6InNlZWQtY2xpbmljIiwiaWF0IjoxNzg1Nzk3OTc5LCJleHAiOjE3ODU3OTg4Nzl9.xeuRuej8rT6fFAWCIbeIqTiXngbfX91zhSKZMkLo4hk",
  },
});

socket.on("connect", () => console.log("connected:", socket.id));
socket.on("appointment:updated", (data) =>
  console.log("appointment:updated", data),
);
socket.on("appointment:checked_in", (data) =>
  console.log("appointment:checked_in", data),
);
socket.on("invoice:created", (data) => console.log("invoice:created", data));
socket.on("connect_error", (err) =>
  console.log("connection failed:", err.message),
);
