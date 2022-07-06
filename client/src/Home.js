import React,{useState,useEffect,useRef} from 'react';
import { FaViacoin } from "react-icons/fa";
import { toast } from "react-toastify";
import "./sass-css/style.css";
import {GoogleLogin} from "react-google-login";
import {gapi} from "gapi-script";
import io from 'socket.io-client';
import { BiSend } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import FacebookLogin from 'react-facebook-login';

const socket = io.connect("http://chattapp2112144.herokuapp.com", { transports: ['websocket', 'polling', 'flashsocket'] });


const Home = () => {
    const cliendId="720727109917-tqsj2lchhl7am49a5okrsm2qsjf5i4tr.apps.googleusercontent.com";
    const [googledata,setGoogleData]=useState("");
    const [logged,setLogged]=useState(false);

    const [message,setMessage]=useState("");
    const [room,setRoom]=useState("");
    const [messageReceived,setMessageReceived]=useState([]);
    const [messageSent,setMessageSent]=useState([]);

    const onLoginSuccess=(res)=>{
        if(room ===""){
            toast.error("Room no is required");
        }else{
            setGoogleData(res.profileObj);
            setLogged(true);
            toast.success(`Login successful to room - ${room}`);
            console.log(res.profileObj);
            // joinRoom();
        }
    }
    const responseFacebook=(res)=>{
        console.log(res);
        if(room !==""){
            setGoogleData(res);
            setLogged(true);
            toast.success(`Login successful to room - ${room}`);
            // joinRoom();
        }else{
            toast.error("Fb autherization failed or Room no. not provided");
        }
    }
    useEffect(()=>{
        joinRoom();
    },[googledata])

    const onLoginFailure=(res)=>{
        console.log("Login failed",res);
        toast.error(`Login failed : ${res.error}`);
    }
    useEffect(()=>{
        function start(){
            gapi.client.init({
                clientId:cliendId,
                scope:""
            })
        };
        gapi.load("client:auth2",start);
        console.clear();
    })

    const sendMessage =()=>{
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('send_message',{message:message.trim(),room,id:socket.id,username:googledata.name,image:`${googledata.imageUrl || googledata.picture.data.url}`,time});
        socket.emit('sended_message',{message:message.trim(),id:socket.id,username:googledata.name,image:`${googledata.imageUrl || googledata.picture.data.url}`,time});
        document.querySelector("#message").value="";
        setMessage("");
    }

    const joinRoom =()=>{
        setMessageReceived([]);
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('join_room',{room,id:socket.id,username:googledata.name,time,message:""});      
        // document.querySelector("#roomNo").value="";
        
    }
    const handleLogout=()=>{
        setMessageReceived([]);
        // setGoogleData("");
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('log_out',{room,id:socket.id,username:googledata.name,time,message:"#admin.logout"});
        setLogged(false);
        // window.location.reload();
    }

    useEffect(()=>{
        // console.log("0effect");
        socket.on("receive_message",(data)=>{
            var newInfo = {key:new Date().getTime().toString(),value:data.message,id:data.id,time:data.time,image:data.image,username:data.username};
            console.log(newInfo);
            setTimeout(() => {
                var obj_div = document.querySelector(".msg_wrap");
                obj_div.scrollTop=obj_div.scrollHeight;   //imp*
            }, 10);
          // console.log(messageReceived);
            setMessageReceived((messageReceived)=>{
            return [...messageReceived,newInfo];
            });
            // toast.info("Message Received");
        })
    },[socket])
    useEffect(()=>{
        // console.log("0effect");
        socket.on("message_sent",(data)=>{
            var newInfo = {key:new Date().getTime().toString(),value:data.message,time:data.time,image:data.image,username:data.username};
            console.log("sending",newInfo);
            setTimeout(() => {
                var obj_div = document.querySelector(".msg_wrap");
                obj_div.scrollTop=obj_div.scrollHeight;
            }, 10);
          // console.log(messageReceived);
            setMessageReceived((messageReceived)=>{
            return [...messageReceived,newInfo];
            });
            // toast.info("Sent");
        })
    },[socket])

    return (
    <div className="home">
        <div className="card">
            <div className="title">
                <FaViacoin/>
                <span>arta</span>
            </div>
            {!logged &&
            <div className="login">
                <input type="text" placeholder="room no." onChange={(e)=>setRoom(e.target.value)}/>
                <hr id="partition"/>
                <GoogleLogin
                className='btn'
                clientId={cliendId}
                buttonText="Login"
                onSuccess={onLoginSuccess}
                onFailure={onLoginFailure}
                cookiePolicy={'single_host_origin'}
                />
                <div className="hr">
                    <hr />
                    Or 
                    <hr />
                </div>
                <FacebookLogin
                    className="fb_login"
                    appId="1021243195244021"
                    autoLoad={false}
                    fields="name,email,picture"
                    callback={responseFacebook} 
                />
            </div>}
            {logged && <div className="chat">
                <div className="liveChat">
                    <p>Live Chat</p>
                    <h6>{googledata.name}</h6>
                    <button onClick={handleLogout} className="logout">Log out</button>
                </div>
                <div className="msg_wrap">
                    {!messageReceived ? null : messageReceived.map(({key,value,id,time,username,image}) =>{
                    if(value === "" && username){
                        return (
                        <div key={key}>
                            <div className="join">{username} joined the room at {time}</div>
                        </div >
                        )
                    }
                    if(value === "#admin.logout"){
                        return (
                        <div key={key}>
                            <div className="join">{username} left the room at {time}</div>
                        </div >
                        )
                    }
                    if(id && value !==""){
                        return (
                            <div key={key} className="left">
                                <div className="first">
                                    <img src={`${image}`} alt="img" />
                                    <div>
                                        <p className="username">{username}</p>
                                        <div>{value}</div>
                                        <p className="time">{time} </p>
                                    </div>
                                </div>
                            </div >
                        )
                        }
                    else if (!id && value !==""){
                        return (
                            <div key={key} className="right">
                                <div className="first">
                                    <div>
                                        <p className="username">you</p>
                                        <div>{value}</div>
                                        <p className="time">{time} </p>
                                    </div>
                                    <img src={`${image}`} alt="img" />
                                </div >
                            </div>
                        )
                    }
                    }) }
                </div>
                <div className="send">
                    <form onSubmit={sendMessage}>
                        <input type="text" placeholder="Message..." id="message" onChange={(e)=>{
                            setMessage(e.target.value);
                        }} className="message_input" required/>
                        {/* <div className="file_input">
                            <input type="file" name="file" id="file"/>
                            <a href="javascript: void(0)"><IoIosAttach/></a>
                        </div> */}
                        {message.length >0 ?
                        <button onClick={sendMessage}><IoSend/></button>:
                        <button><BiSend/></button>}
                    </form>
                </div>
            </div> }
        </div>
    </div>
    )
}

export default Home;