// web/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import WebMap from './components/WebMap/WebMapView';
import Login from './components/Login/LoginView';
import UploadView from './components/UploadView';
import "@fontsource/jost";


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login/>}></Route>
                <Route path="/map" element={<WebMap/>}></Route>
                <Route path="/upload" element={<UploadView/>}></Route>
            </Routes>
        </Router>
    );
};

export default App;
