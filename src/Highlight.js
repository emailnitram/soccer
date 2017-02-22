import React, { Component } from 'react';
import timeago from 'timeago.js';
import CopyToClipboard from 'react-copy-to-clipboard';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: '',
      poster: '',
      timeString: '',
      copied: false
    }
  }
  componentDidMount() {
    fetch(`https://api.streamable.com/videos/${this.props.shortCode}`).then(resp => resp.json()).then(data => {
      let url = data.files && data.files['mp4-mobile'] && data.files['mp4-mobile'].url;
      if(!url) {
        url = data.files && data.files['mp4'] && data.files['mp4'].url;
      }
      const poster = data.thumbnail_url;
      if (!url || !poster) return;
      const timeString = new timeago().format(this.props.timestamp * 1000);
      this.setState({
        src: `https:${url}`,
        poster: `https:${poster}`,
        timeString
      })
    })
  }
  render() {
    if (this.state.src === '') return false;
    return (
      <div className="highlight">
        <h2>{this.props.title}</h2>
        <video controls src={this.state.src} poster={this.state.poster} playsInline preload="none">
        </video>
        <div className="share-container">
          <CopyToClipboard text={`${this.props.title} - https://streamable.com/${this.props.shortCode}`}
            onCopy={() => this.setState({copied: true})}>
            <button className="copy-button">Copy Link</button>
          </CopyToClipboard>
          {this.state.copied ? <span style={{color: 'red'}}>&nbsp;Copied.</span> : null}
          <span className="timestring">{this.state.timeString}</span>
        </div>
      </div>
    );
  }
}

export default App;
