import React, { Component } from 'react';
import Highlight from './Highlight';
import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      after: '',
      videos: [],
      loading: false
    }

    this.search = false;
    this.subreddit = 'nba';

    this.handleScroll = this.handleScroll.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  fetchReddit() {
    this.setState({loading: true});
    let url = `https://www.reddit.com/r/${this.subreddit}.json?after=${this.state.after}&raw_json=1`;
    if (this.search) {      
      url = `https://www.reddit.com/r/${this.subreddit}/search.json?q=${this.state.query}+site%3Astreamable.com&restrict_sr=on&sort=new&t=all&after=${this.state.after}&raw_json=1`
    }
    fetch(url).then(resp => resp.json()).then(data => {
      let streamableFound = false;
      let children = data.data.children;
      const after = data.data.after;
      this.setState({after});
      children.forEach(child => {
        if(child.data.url.includes('streamable')) {
          streamableFound = true;
          const shortCode = child.data.url.split('/')[3];
          const title = child.data.title;
          const timestamp = child.data.created_utc;
          const video = {
            shortCode,
            title,
            timestamp
          }
          const vids = this.state.videos;
          const videos = vids.concat(video)
          this.setState({videos, loading: false});
        }
      })
      if (this.state.videos.length < 5 || !streamableFound) {
        this.fetchReddit(this.search)
      }
    })
  }
  componentDidMount() {
    this.fetchReddit();
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleSearch(e) {
    e.preventDefault();
    this.setState({videos: [], after: ''});
    this.fetchReddit(true);
  }

  handleScroll() {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight) {
      if (!this.state.loading) {
        this.fetchReddit();
      }
    }
  }

  handleChange(event) {
    this.search = true;
    this.setState({query: event.target.value});
  }

  render() {
    return (
      <div className="container">
        <div className="search-container">
          <form onSubmit={this.handleSearch}>
            <input type="text" value={this.state.query} onChange={this.handleChange} />
            <input type="submit" value="Search" />
          </form>
        </div>
        {this.state.videos.map((video, index) => {
          return <Highlight
                   key={index}
                   shortCode={video.shortCode}
                   title={video.title}
                   timestamp={video.timestamp}
                 />
        })}
        {this.state.loading ? <div className="loader">Loading...</div> : null}
      </div>
    );
  }
}

export default App;
