import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader'
import List from 'react-virtualized/dist/commonjs/List'
import RealtimeRow from './RealtimeRow'

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

    const key = snap ? snap.key : null
    const val = snap ? snap.val() : null

    if (list.indexOf(key) === -1) {
      list.push(key)

      return this.setState({
        list,
        pages: { ...pages, [list.length - 1]: key },
        values: { ...values, [key]: val },
        lastIndex
      })
    }

  }

  setValue = (uid, val) => {
    const { pages, list, values } = this.state

    this.setState({
      values: { ...values, [uid]: val }
    })
  }


  getProps = () => {
    return { ...defaults, ...this.props }
  }

  loadRows = (startIndex, stopIndex, calls = 0) => {
    const { firebaseApp, deferTime, deferCalls, path, offset, isReverse } = this.getProps()
    const { pages, ref } = this.state
    const rowsToLoad = stopIndex - startIndex + 1

    if (calls > deferCalls) {
      return
    }

    let query

    if (startIndex !== 0 && pages[startIndex - 1]) {
      if (isReverse) {
        query = firebaseApp.database().ref(path).orderByKey().endAt(pages[startIndex - 1]).limitToLast(rowsToLoad)
      } else {
        query = firebaseApp.database().ref(path).orderByKey().startAt(pages[startIndex - 1]).limitToFirst(rowsToLoad)
      }

    } else if (startIndex === 0) {
      if (isReverse) {
        query = firebaseApp.database().ref(path).orderByKey().limitToLast(rowsToLoad)
      } else {
        query = firebaseApp.database().ref(path).orderByKey().limitToFirst(rowsToLoad)
      }
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

      let list = []

      snapshot.forEach(snap => {
        list.push(snap)
      })

      if (isReverse) {
        list = list.reverse()
      }

      list.forEach(snap => {
        pageIndex++
        this.addElement(snap, pageIndex, lastIndex)
      })

      //Case when the list is empty
      if (lastIndex === -1) {

        this.addElement(null, -1, lastIndex)

        if (ref) {
          ref.off()
        }

        let nRef

        if (isReverse) {
          nRef = firebaseApp.database().ref(path).orderByKey().limitToLast(offset)
        } else {
          nRef = firebaseApp.database().ref(path).orderByKey().limitToFirst(offset)
        }

        this.setState({ list: [] })

        this.setState({ ref: nRef }, () => {

          nRef.on('child_added', snap => {
            this.loadRows(startIndex, stopIndex + 1, 0)
          })
        })
      }

      //Case when we are at the end of the list
      //We should listen here for child added events
      if (lastIndex && !ref && pages[lastIndex - 1]) {

        if (ref) {
          ref.off()
        }

        const nRef = firebaseApp.database().ref(path).orderByKey().startAt(pages[lastIndex - 1]).limitToFirst(offset)

        this.setState({ ref: nRef }, () => {
          nRef.on('child_added', snap => {
            this.loadRows(startIndex, stopIndex + 1, 0)
          })
        })

      }
    }).catch(e => {
      console.log(e)
    })

  }

  getRowProps = (p) => {
    const { key, index, style } = p
    const { renderRow, firebaseApp } = this.props
    const { list, values, lastIndex } = this.state

    const uid = list[index] ? list[index] : null
    const val = values[uid] !== undefined ? values[uid] : undefined
    let isLoading = true
    let isOfset = false
    let isLoaded = false
    let isDeleted = false

    if (lastIndex !== undefined && index >= lastIndex) {
      isLoading = false
    } else {
      isOfset = true
    }

    if (uid) {
      isLoaded = true
      isLoading = false
    }

    if (val === null) {
      isDeleted = true
    }

    return {
      key,
      index,
      style,
      uid,
      val,
      lastIndex,
      isLoading,
      isLoaded,
      isOfset,
      isDeleted,
      setValue: this.setValue,
      listRef: this.List,
      ...this.props
    }


  }


  rowRenderer = (p) => {

    const props = this.getRowProps(p)

    return <RealtimeRow
      {...props}
    />

  }

  getRowHeight = (p) => {

    const { getRowHeight, listProps } = this.props

    if (getRowHeight !== undefined) {
      return getRowHeight(this.getRowProps(p))
    } else {
      return listProps ? listProps.listRowHeight : 20
    }
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
            ref={list => {
              this.List = list
              registerChild(list)
            }}
            rowCount={count}
            rowRenderer={this.rowRenderer}
            height={height}
            rowHeight={this.getRowHeight}
            {...listProps}
          />
        )}
      </InfiniteLoader>
    )
  }
}

InfiniteRTDList.propTypes = {
  firebaseApp: PropTypes.any
}

export default InfiniteRTDList
