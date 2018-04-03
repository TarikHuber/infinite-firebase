import React, { Component } from 'react'
import PropTypes from 'prop-types'


class RealtimeRow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ref: null
    }
  }


  componentWillReceiveProps(nextProps) {
    const { firebaseApp, path, uid, setValue, listRef, index } = nextProps
    const { ref } = this.state

    if (!ref && uid) {

      const ref = firebaseApp.database().ref(`${path}/${uid}`)
      this.setState({ ref })

      ref.on('value', snap => {

        this.setState({
          value: snap.val(),
        }, () => {
          setValue(uid, snap.val())

          //Update the row height on change
          //We need this on deletion to hide the deleted row
          listRef.recomputeRowHeights(index)
        })

      })

    }



  }


  componentWillUnmount() {
    const { ref } = this.state
    if (ref) {
      ref.off()
    }
  }


  render() {
    const { renderRow, val, uid } = this.props
    const { value } = this.state

    const v = value !== undefined ? value : val
    let isDeleted = false

    if (v === null) {
      isDeleted = true
    }

    return renderRow({ ...this.props, value: v, isDeleted })
  }
}

RealtimeRow.propTypes = {
  firebaseApp: PropTypes.any
}

export default RealtimeRow
