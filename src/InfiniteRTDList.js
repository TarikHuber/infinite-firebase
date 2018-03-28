import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader'
import List from 'react-virtualized/dist/commonjs/List'


const defaults = {
  deferTime: 2000,
  deferCalls: 3,
  minimumBatchSize: 50,
  threshold: 50,
  offset: 30
}


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

  addElement = (snap, pageIndex, lastIndex) => {
    const { pages, list, values } = this.state

    if (list.indexOf(snap.key) === -1) {
      list.push(snap.key)

      //console.log(lastIndex)

      return this.setState({
        list,
        pages: { ...pages, [list.length - 1]: snap.key },
        values: { ...values, [snap.key]: snap.val() },
        lastIndex
      })
    }


  }


  getProps = () => {
    return { ...defaults, ...this.props }
  }

  loadRows = (startIndex, stopIndex, calls = 0) => {
    const { firebaseRef, deferTime, deferCalls } = this.getProps()
    const { pages } = this.state
    const rowsToLoad = stopIndex - startIndex + 1

    //console.log(this.state)
    //console.log(`start ${startIndex} end ${stopIndex} calls ${calls} key ${pages[startIndex]}`)

    if (calls > deferCalls) {
      return
    }

    //console.log('Time out load. Calls', calls)

    let query

    if (startIndex !== 0 && pages[startIndex - 1]) {
      query = firebaseRef.orderByKey().startAt(pages[startIndex - 1]).limitToFirst(rowsToLoad)
    } else if (startIndex === 0) {
      query = firebaseRef.orderByKey().limitToFirst(rowsToLoad)
    } else {
      return this.timeOutPromise(deferTime).then(() => {
        return this.loadRows(startIndex, stopIndex, ++calls)
      })
    }



    return query.once('value', snapshot => {
      let pageIndex = startIndex
      const rowsLoaded = snapshot.numChildren()
      let lastIndex = undefined

      if (rowsToLoad > rowsLoaded) {
        lastIndex = pageIndex + snapshot.numChildren() - 1
      }


      snapshot.forEach(snap => {
        pageIndex++
        this.addElement(snap, pageIndex, lastIndex)
      })

    }).catch(e => {
      console.log(e)
    })

  }


  rowRenderer = ({ key, index, style }) => {
    const { renderRow } = this.props
    const { list, values, lastIndex } = this.state

    const uid = list[index] ? list[index] : null
    const val = values[uid] ? values[uid] : null
    let isLoading = true
    let isOfset = false
    let isLoaded = false

    if (lastIndex !== undefined && index >= lastIndex) {
      isLoading = false
    } else {
      isOfset = true
    }

    if (uid) {
      isLoaded = true
      isLoading = false
    }

    return renderRow({ key, index, style, uid, val, lastIndex, isLoading, isLoaded, isOfset })
  }

  render() {
    const {
      offset,
      rowCount,
      minimumBatchSize,
      threshold,
      listProps,
      loaderProps,
      height
    } = this.getProps()
    const { values } = this.state
    const count = rowCount ? rowCount : Object.keys(values).length + offset

    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={({ startIndex, stopIndex }) => { this.loadRows(startIndex, stopIndex) }}
        rowCount={count}
        minimumBatchSize={minimumBatchSize}
        threshold={threshold}
        {...loaderProps}
      >
        {({ onRowsRendered, registerChild }) => (
          <List
            onRowsRendered={onRowsRendered}
            ref={registerChild}
            rowCount={count}
            rowRenderer={this.rowRenderer}
            height={height}
            {...listProps}
          />
        )}
      </InfiniteLoader>
    )
  }
}

InfiniteRTDList.propTypes = {
  firebaseRef: PropTypes.any
}

export default InfiniteRTDList
