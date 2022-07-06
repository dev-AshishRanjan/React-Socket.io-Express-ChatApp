import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Home from "./Home";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ToastContainer
      position="top-right"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <Routes>
      <Route exact path="/" element={<Home />}></Route>
      {/* <Route path="*" element={<Error/>}></Route> */}
    </Routes>
  </Router>
);