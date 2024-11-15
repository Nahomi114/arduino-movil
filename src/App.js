import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [systemState, setSystemState] = useState({
    servoPos: 0,
    potValue: 0,
    systemEnabled: false,
    potControl: false,
    isReset: true
  });

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.3:8080');

    socket.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      setWs(socket);
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ESP32_DISCONNECTED') {
        setConnected(false);
      } else {
        setSystemState(data);
      }
    };

    socket.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const toggleSystem = () => {
    if (ws) {
      ws.send(JSON.stringify({
        enable: !systemState.systemEnabled
      }));
    }
  };

  const togglePotControl = () => {
    if (ws) {
      ws.send(JSON.stringify({
        potControl: !systemState.potControl
      }));
    }
  };

  const setServoPosition = (position) => {
    if (ws && !systemState.potControl) {
      ws.send(JSON.stringify({
        servoPos: parseInt(position)
      }));
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Control del ESP32</h1>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Conectado' : 'Desconectado'}
        </div>
      </header>

      <main>
        <div className="widget">
          <h2>Estado del Sistema</h2>
          <div className="toggle">
            <input
              type="checkbox"
              id="system-toggle"
              checked={systemState.systemEnabled}
              onChange={toggleSystem}
            />
            <label htmlFor="system-toggle"></label>
          </div>
          <p>Sistema {systemState.systemEnabled ? 'Habilitado' : 'Deshabilitado'}</p>
        </div>

        <div className="widget">
          <h2>Control del Servo</h2>
          <div className="toggle">
            <input
              type="checkbox"
              id="pot-toggle"
              checked={systemState.potControl}
              onChange={togglePotControl}
            />
            <label htmlFor="pot-toggle"></label>
          </div>
          <p>Control por {systemState.potControl ? 'Potenciómetro' : 'Remoto'}</p>
          <input
            type="range"
            min="0"
            max="180"
            value={systemState.servoPos}
            onChange={(e) => setServoPosition(e.target.value)}
            disabled={systemState.potControl || !systemState.systemEnabled}
          />
          <p>Posición: {systemState.servoPos}°</p>
        </div>

        <div className="widget">
          <h2>Estado del Sistema</h2>
          <div className={`status-indicator ${systemState.isReset ? 'active' : ''}`}>
            LED de Reinicio
          </div>
          <div className={`status-indicator ${systemState.systemEnabled ? 'active' : ''}`}>
            LED de Arranque
          </div>
          <p>Valor del Potenciómetro: {systemState.potValue}</p>
        </div>
      </main>
    </div>
  );
};

export default App;