const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    },
});

let messageHistory = [];

const getMessages = (roomId) => {
    return messageHistory.filter((message) => message.roomId === roomId);
};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`user with id-${socket.id} joined room - ${roomId}`);
        // This will send the message history to the user who joined the room
        for (const message of getMessages(roomId)) {
            socket.emit("receive_msg", message);
        }
    });

    socket.on("send_msg", (data) => {
        console.log(data, "DATA");
        //This will send a message to a specific room ID
        socket.to(data.roomId).emit("receive_msg", data);
        messageHistory.push(data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});
