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
    const { firebaseApp, path, uid, setValue } = nextProps
    const { ref } = this.state

    if (!ref && uid) {

      const ref = firebaseApp.database().ref(`${path}/${uid}`)
      this.setState({ ref })

      ref.on('value', snap => {

        this.setState({
          value: snap.val(),
        }, () => {
          setValue(uid, snap.val())
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
    const { renderRow, val } = this.props
    const { value } = this.state

    return renderRow({ ...this.props, value: value ? value : val })
  }
}

RealtimeRow.propTypes = {
  firebaseApp: PropTypes.any
}

export default RealtimeRow
