import React, { Component } from 'react'
import { render } from 'react-dom'
import firebaseApp from './firebase'
import InfiniteRTDList from '../../src'
import Manipulations from './Manipulations'

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null
    };
  }

  renderRow = (props) => {

    const { key, index, style, uid, value, lastIndex, isLoading, isLoaded, isDeleted } = props

    if (isLoaded) {
      return (
        <div
          onClick={() => {
            this.setState({ selected: props })
          }}
          style={{
            ...style,
            color: isDeleted ? 'red' : undefined,
            cursor: 'pointer'
          }}
          key={key}>
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
    return <div style={{ display: 'flex' }}>
      <div>
        <h1>infinite-firebase Demo</h1>
        <InfiniteRTDList
          firebaseApp={firebaseApp}
          path={'infinite_list'}
          renderRow={this.renderRow}
          listProps={{ height: 400, width: 700, rowHeight: 20 }}
        />
      </div>

      <Manipulations
        firebaseApp={firebaseApp}
        selected={this.state.selected}
      />
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
