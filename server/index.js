const express = require("express");
const app = express();
const http = require("http");
const {Server} =require("socket.io");
const cors = require("cors");

app.use(cors());
const users_list=[];
const port= process.env.PORT || 3001;

const server = http.createServer(app);

const io= new Server(server,{
    cors: {
        origin: 'https://localhost:3000',
        method: ["GET","POST"],
        credentials: true
    },
});

io.on("connection", (socket)=>{
    console.log(`user connected : ${socket.id}`);
    socket.on("send_message",(data)=>{
        if(data.message !==""){
            console.log(data);
            socket.to(data.room).emit("receive_message",data);
            // socket.off('MY_EVENT', doThisOnlyOnce).on('MY_EVENT', doThisOnlyOnce);
        }
    });
    socket.on("join_room",(data)=>{
        console.log(data.username, "joined");
        socket.join(data.room);
        users_list.push(data);
        socket.to(data.room).emit("receive_message",data);
        io.sockets.to(data.id).emit("message_sent",{...data,username:"You"});
        // socket.to(data).emit("receive_message",data);
    });
    socket.on("sended_message",(data)=>{
        if(data.message !==""){
            console.log("sending",data);
            io.sockets.to(data.id).emit("message_sent",data);  //imp*
        }
    });
    socket.on("log_out",(data)=>{
        console.log(data);
        socket.to(data.room).emit("receive_message",data);
    });
    socket.on("disconnect",(data)=>{
        var data_dis={};
        users_list.forEach((element)=>{
            if(element.id === socket.id){
                data_dis=element;
            }
        });
        if(data_dis){
            console.log("user disconnected",data,socket.id);
            socket.to(data_dis.room).emit("receive_message",{...data_dis,message:"#admin.logout"});
        }
    });
});

server.listen(port,()=>{
    console.log("**Server is running**");
})
