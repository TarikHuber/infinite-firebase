import React, { Component } from 'react'
import { render } from 'react-dom'
import firebaseApp from './firebase'
import InfiniteRTDList from '../../src/InfiniteRTDList'

class Demo extends Component {

  renderRow = ({ key, index, style, uid, object }) => {
    return (
      <div
        key={key}
        style={{ ...style }}
      >
        {index} {!uid && 'Loading...'} {uid} {object}
      </div>
    )
  }

  render() {
    return <div>
      <h1>infinite-firebase Demo</h1>
      <InfiniteRTDList
        firebaseRef={firebaseApp.database().ref('infinite_list')}
        renderRow={this.renderRow}
        listProps={{ height: 400, width: 700, rowHeight: 20 }}
      />
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
