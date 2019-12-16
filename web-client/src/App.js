import React from 'react';
import io from 'socket.io-client';
import { subscribeUser } from "./subscription";

const socket = io(process.env.NODE_ENV === 'production' ? 
process.env.REACT_APP_API_URL : 'http://localhost:5000/'); 

const toDataURL = (file, callback) => {
  var reader = new FileReader();
  reader.onloadend = function() {
    callback(reader.result);
  }
  reader.readAsDataURL(file);
}

class App extends React.Component {
  constructor(props) {
    super(props);
		this.fileInput = React.createRef();
  }
  
  state = { on: false, images: [], times: [] }

  componentDidMount() {
    subscribeUser();
    if (socket !== null) {
      this.setState({ socket });
      this.subscribeToValues();
    }
  }
  subscribeToValues = () => {
    socket.on('ON_VALUE', value => {
      this.setState({ on: value });
    });
    socket.on('IMAGES', (images , times) => {
      this.setState({ images, times });
    })
    socket.on('PICTURE_TAKEN', e => {
      console.log("hello");
      subscribeUser("Movement detected.", "Click here to see photos of the intruder.");
    })
  }

  handleClick = () => {
    const { on } = this.state;
    if (socket !== null) {
      socket.emit("TOGGLE_ON", !on);
    }
  }
  clearImages = () => {
    if (socket !== null) {
      socket.emit("CLEAR_IMAGES");
    }
  }

  handleFileSelect = async (event) => {
    toDataURL(event.target.files[0], (data) => {
      socket.emit("TAKE_PICTURE", data)
    })
	}

  render() {
    return (
      <main className="container">
          <div style={{textAlign: 'center'}}>
              <h1>Yam Roll Controller</h1>
              <input 
                type="file" 
                id="email-input" 
                ref={this.fileInput} 
                onChange={(e) => this.handleFileSelect(e)} 
              />
              <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: '1em'}}>
                  <h5 style={{margin: 0, marginRight: '1em'}}>Power</h5>
                  <div className={`switch ${this.state.on ? "on" : "off"}`} onClick={() => this.handleClick()}>
                      <div className="switch-handle"></div>
                  </div>
              </div>
              <button onClick={() => this.clearImages()} className="danger">Clear Images</button>
              <div className="image-grid">
                { this.state.images.map((e,i) => {
                  return (
                    <div className="grid-image-wrapper" key={i}>
                      <img src={e} className="grid-image" alt=""/>
                      <h5>{this.state.times[i]}</h5>
                    </div>
                  )
                })}
              </div>
          </div>
      </main>
    );
  }
}

export default App;
