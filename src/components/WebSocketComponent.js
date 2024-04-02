import React, { useEffect } from 'react';
import  Centrifuge  from 'centrifuge';

const WebSocketComponent = () => {
  const channel = "chat:index";
  useEffect(() => {
    // Initialize Centrifuge client
    const centrifuge = new Centrifuge('wss://stock-api2.fnotrader.com/connection/websocket');
    centrifuge.on('connect', () => {
      console.log('Connected to Centrifuge');
      
      // Subscribe to a channel
      // const channel = centrifuge.subscribe('your-channel');

      // channel.on('publish', (data) => {
      //   console.log('Received message:', data);
      //   // Handle the received data
      // });

      // ... Add more channel event listeners or configurations as needed
    });
    const channel = centrifuge.subscribe('256265',handleMessage);
    centrifuge.connect(); // Make sure this line is executed after initialization

    
  }, []); // Empty dependency array means this runs once when the component mounts

  const tagsToReplace = {'&': '&amp;', '<': '&lt;', '>': '&gt;'};
  
  function replaceTag(tag) {return tagsToReplace[tag] || tag;}
  function safeTagsReplace(str) {return str.replace(/[&<>]/g, replaceTag);}

  function handleMessage(message) {
    debugger;
    let clientID;
    if (message.info){
        clientID = message.info.client;
    } else {
        clientID = null;
    }
    const inputText = message.data["dl"].toString();
    const text = safeTagsReplace(inputText) + ' <span class="muted">from ' + clientID + '</span>';
    //console.log(text);
}

  return (
    <div>
      {/* Your React component JSX */}
    </div>
  );
};

export default WebSocketComponent;