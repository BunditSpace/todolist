const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;
const socketIO = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let todoList = [];
socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on("addTodo", (todo) => {
        //👇🏻 Adds the to-do object to the list of to-dos
        todoList.unshift(todo);
        //👇🏻 Sends all the to-dos to the React app
        socketIO.sockets.emit("todos", todoList);
    });
    socket.on("deleteTodo", (id) => {
        todoList = todoList.filter((todo) => todo.id !== id);
        //👇🏻 Sends the updated to-do to the React app
        socketIO.sockets.emit("todos", todoList);
    });

    socket.on("todos", (id) => {
        socket.emit("todos", todoList);
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api", (req, res) => {
	res.json(todoList);
});

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});