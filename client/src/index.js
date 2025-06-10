// client/src/index.js
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './serviceWorker';
import App from './App';
import './index.css';
// ĐẶT TẤT CẢ CÁC IMPORT LÊN TRÊN CÙNG

window.process = process; // Code thực thi sau các import

ReactDOM.render(<App />, document.getElementById('root')); // Hoặc <React.StrictMode><App /></React.StrictMode>
registerServiceWorker();