import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Manipulations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      newVal: ''
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.props.selected !== newProps.selected) {
      this.setState({ newVal: newProps.selected.value ? newProps.selected.value : '' })
    }
  }

  addRows = () => {
    const { firebaseApp } = this.props
    const { amount } = this.state

    const updates = {}
    const ref = firebaseApp.database().ref('infinite_list')

    for (let index = 0; index < amount; index++) {

      const key = ref.push().key
      updates[`/infinite_list/${key}`] = index
    }

    firebaseApp.database().ref().update(updates, () => {
      console.log('All rows added')
    })

  }

  deleteAll = () => {
    const { firebaseApp } = this.props

    firebaseApp.database().ref('infinite_list').remove(() => {
      console.log('All rows removed')
    })
  }

  saveRowChange = () => {
    const { firebaseApp, selected } = this.props
    const { newVal } = this.state

    firebaseApp.database().ref(`infinite_list/${selected.uid}`).set(newVal, () => {
      console.log('Row saved')
    })

  }

  deleteRow = () => {
    const { firebaseApp, selected } = this.props
    const { newVal } = this.state

    firebaseApp.database().ref(`infinite_list/${selected.uid}`).remove(() => {
      console.log('Row deleted')
    })

  }


  render() {
    const { selected } = this.props

    return (
      <div style={{ padding: 15 }}>
        <button
          style={{ color: 'red' }}
          onClick={this.deleteAll} >
          DELETE ALL
        </button>
        <br />
        <br />
        <input
          name={'amount'}
          type={'number'}
          onChange={e => { this.setState({ amount: e.target.value }) }}
        />
        <button
          disabled={!this.state.amount}
          onClick={this.addRows} >
          ADD
        </button>
        <br />
        <br />
        {selected && <div>
          {selected.uid}
          <br />
          <input
            name={'value'}
            value={this.state.newVal}
            placeholder={selected.value}
            onChange={e => { this.setState({ newVal: e.target.value }) }}
          />

          <button
            style={{ color: 'green' }}
            onClick={this.saveRowChange} >
            SAVE
        </button>
          <button
            style={{ color: 'red' }}
            disabled={selected.isDeleted}
            onClick={this.deleteRow} >
            DELETE
        </button>
        </div>}
      </div>
    )
  }
}


export default Manipulations
