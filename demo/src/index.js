import React, { Component } from 'react'
import { render } from 'react-dom'
import firebaseApp from './firebase'
import InfiniteRTDList from '../../src'

class Demo extends Component {

  renderRow = ({ key, index, style, uid, value, lastIndex, isLoading, isLoaded }) => {

    if (isLoaded) {
      return (
        <div key={key} style={{ ...style }}>
          {index} {uid} {value} {lastIndex}
        </div>
      )
    }

    if (isLoading) {
      return (
        <div key={key} style={{ ...style }}>
          {index} {'Loading...'} {lastIndex}
        </div>
      )
    }

    return null
  }

  render() {
    return <div>
      <h1>infinite-firebase Demo</h1>
      <InfiniteRTDList
        firebaseApp={firebaseApp}
        path={'infinite_list'}
        renderRow={this.renderRow}
        listProps={{ height: 400, width: 700, rowHeight: 20 }}
      />
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
