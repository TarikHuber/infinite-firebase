import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader'
import List from 'react-virtualized/dist/commonjs/List'

class InfiniteRTDList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      values: {},
      pages: {}
    }
  }

  isRowLoaded = ({ index }) => {
    const { list } = this.state

    return !!list[index];
  }

  timeOutPromise = (ms) => {
    return new Promise(function (resolve, reject) {

      setTimeout(() => {
        resolve()
      }, ms);
    })
  }

  addElement = (snap, pageIndex) => {
    const { pages, list, values } = this.state

    if (list.indexOf(snap.key) === -1) {
      list.push(snap.key)

      return this.setState({
        list,
        pages: { ...pages, [list.length - 1]: snap.key },
        values: { ...values, [snap.key]: snap.val() }
      })
    }


  }


  loadRows = (startIndex, stopIndex, calls = 0) => {
    const { firebaseRef } = this.props
    const { pages } = this.state

    console.log(this.state)
    console.log(`start ${startIndex} end ${stopIndex} calls ${calls} key ${pages[startIndex]}`)

    if (calls > 3) {
      return
    }

    console.log('Time out load. Calls', calls)

    let query

    if (startIndex !== 0 && pages[startIndex - 1]) {
      query = firebaseRef.orderByKey().startAt(pages[startIndex - 1]).limitToFirst(stopIndex - startIndex + 1)
    } else if (startIndex === 0) {
      query = firebaseRef.orderByKey().limitToFirst(stopIndex - startIndex + 1)
    } else {
      return this.timeOutPromise(2000).then(() => {
        return this.loadRows(startIndex, stopIndex, ++calls)
      })
    }

    return query.once('value', snapshot => {
      let pageIndex = startIndex
      snapshot.forEach(snap => {
        pageIndex++
        this.addElement(snap, pageIndex)
      })
    }).catch(e => {
      console.log(e)
    })

  }


  loadMoreRows = ({ startIndex, stopIndex }) => {

    return this.loadRows(startIndex, stopIndex)
  }

  rowRenderer = ({ key, index, style }) => {

    const { list, values } = this.state

    const uid = list[index] ? list[index] : ''
    const object = values[uid] ? values[uid] : ''


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
    const { intl, muiTheme } = this.props
    const { values } = this.state

    const count = Object.keys(values).length + 30
    //const count = 2300

    return (

      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={count}
        minimumBatchSize={50}
        threshold={50}
      >
        {({ onRowsRendered, registerChild }) => (
          <List
            height={400}
            onRowsRendered={onRowsRendered}

            ref={registerChild}
            rowCount={count}
            rowHeight={20}
            rowRenderer={this.rowRenderer}
            width={700}
          />
        )}
      </InfiniteLoader>
    )
  }
}

InfiniteRTDList.propTypes = {
  firebaseApp: PropTypes.object.any
}

export default InfiniteRTDList
