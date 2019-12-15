import React from 'react';
import io from 'socket.io-client';

const socket = io('http://192.168.1.36:5000'); 

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
    if (socket !== null) {
      this.setState({ socket });
      this.subscribeToValues((err, value) => {
        this.setState({ on: value });
      });
    }
  }
  subscribeToValues = (cb) => {
    socket.on('ON_VALUE', value => cb(null, value));
    socket.on('IMAGES', (images , times) => {
      this.setState({ images, times });
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
                    <div className="grid-image-wrapper">
                      <img src={e} key={i} className="grid-image" alt=""/>
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
