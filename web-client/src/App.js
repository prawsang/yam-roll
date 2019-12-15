import React from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); 

class App extends React.Component {
  state = { on: false }
  componentDidMount() {
    if (socket !== null) {
      this.setState({ socket });
      this.subscribeToValues((err, value) => {
        this.setState({ on: value });
      });
    }
  }
  subscribeToValues = (cb) => {
    socket.on('ON_VALUE', value => cb(null, value));
  }

  handleClick = () => {
    const { on } = this.state;
    if (socket !== null) {
      socket.emit("TOGGLE_ON", !on);
    }
  }
  render() {
    return (
      <main className="container">
          <div style={{textAlign: 'center'}}>
              <h1>Yam Roll Controller</h1>
              <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <h5 style={{margin: 0, marginRight: '1em'}}>Power</h5>
                  <div className={`switch ${this.state.on ? "on" : "off"}`} onClick={() => this.handleClick()}>
                      <div className="switch-handle"></div>
                  </div>
              </div>
          </div>
      </main>
    );
  }
}

export default App;
