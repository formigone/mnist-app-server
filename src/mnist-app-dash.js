import React, { PureComponent } from 'react';

import './style.css';

import Nav from './components/Nav';

class MnistAppDash extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      description: props.description || 'This is a sample component...',
    };
  }

  render() {
    const { description } = this.state;
    return (
      <div>
        <Nav description={description} />
      </div>
    );
  }
}

export default MnistAppDash;
module.exports = MnistAppDash;