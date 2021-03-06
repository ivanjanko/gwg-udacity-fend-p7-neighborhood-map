import React, { Component } from 'react'
import './App.css'
import SquareAPI from './SquareAPI'
import MapComp from './MapComp'
import Drawer from './Drawer'
import ErrorComp from './ErrorComp'

const style = {
  list: {
    padding: 5
  },
  inputField: { 
    width: '-webkit-fill-available',
    color: 'blue',
    margin: '0.9rem',
    background: '#eee'
  },
  listButton: {
    width: '-webkit-fill-available',
    padding: 12,
    textTransform: 'none',
  },
  map: {
    margin: 12,
    borderRadius: 5,
  }
}

class App extends Component {

  state = {
    squareVenues: [],
    filterdVenues: [],
    allMarkers: [],
    zoom: 14,
    center: {},
    mapCenter: {},
    mapLoaded: false,
    dropPins: true,
    selectedPlace: null,
    showingInfoWindow: false,
    squareAPIerror: false,
    mapVisible: true
  }

  componentDidMount() {
    SquareAPI.search({
      near: 'New York, NY',
      query: 'library',
      limit: 10
    }).then(results => {
      // when squareAPI responds with error message
      this.setState({
        squareVenues: results.response.venues,
        filterdVenues: results.response.venues,
        mapCenter: results.response.geocode.feature.geometry.center,
        
      })
    }).catch(() => this.setState( {squareAPIerror: true, mapVisilbe: false} ))
  }

  whenMapIsReady = (mapProps, map) => {
    console.log('MAP ready')
    this.setState({ map })
    setTimeout(() => this.createMarkers(), 750)
  };

  createMarkers = () => {

    let allMarkers = []
    
    this.state.filterdVenues.forEach((aVenue, idx) => {
    
      window.setTimeout(() => {
        let marker = new window.google.maps.Marker({
          map: this.state.map,
          name: aVenue.name,
          location: aVenue.location,
          visible: true,
          animation: this.state.dropPins ? window.google.maps.Animation.DROP: null,
          position: { lat: aVenue.location.lat, lng: aVenue.location.lng },
        })
        marker.addListener('click', () => this.onMarkerClick(marker))
        allMarkers.push(marker)
      }, this.state.dropPins ? idx * 175: idx * 50)

      this.setState({ allMarkers })
    })
  }

  // this function is not in use
  clearMarkers = () => {
    this.state.allMarkers.forEach(marker => marker.setMap(null))
  }

  onMarkerClick = (marker) => {
    this.setState({
      selectedPlace: marker,
      showingInfoWindow: true
    })
    this.handleBounce(marker)
  }

  handleBounce = (marker) => {
    marker.setAnimation(window.google.maps.Animation.BOUNCE)
    setTimeout(() => marker.setAnimation(null), 2500)
  }

  onListClick = (event) => {
    console.log('listButton Clicked', event)
    // find matching marker
    let marker = this.state.allMarkers.find(aMarker =>
      aMarker.name === event.target.innerText)
    // update active place
    this.onMarkerClick(marker)
  }

  closeInfoWindow = () => this.setState({
    selectedPlace: null,
    showingInfoWindow: false
  })

  onQueryChange = (query) => {
    this.filterMarkers(query)
    this.setState({
      query,
      filterdVenues: this.filterVenues(query),
      dropPins: false,
      showingInfoWindow: false
    })
  }

  filterVenues = (query) => {
    return this.state.squareVenues.filter(aVenue => 
      aVenue.name.toLowerCase().includes(query.toLowerCase()))
  }

  filterMarkers = (query) => {
    this.state.allMarkers.map(marker =>
      marker.name.toLowerCase().includes(query.toLowerCase()) ? marker.setMap(this.state.map) :marker.setMap(null)
    )
  }

  render() {

    return (
      <div className='main'>
        <Drawer 
          style={style}
          state={this.state}
          onListClick={this.onListClick}
          onQueryChange={this.onQueryChange}
          closeInfoWindow={this.closeInfoWindow}
        />
        <MapComp
          style={style}
          state={this.state}
          onMarkerClick={this.onMarkerClick}
          whenMapIsReady={this.whenMapIsReady}
          closeInfoWindow={this.closeInfoWindow}
        />
        {this.state.squareAPIerror && <ErrorComp />}
      </div>
  )
  }
}

export default (App);
