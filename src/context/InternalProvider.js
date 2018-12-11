import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "./createWordsbyContext";

class InternalProvider extends Component {
  state = {
    pageContext: this.props,
    // state updates
    updateContext: obj => this.setState(obj)
  };
  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

InternalProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default InternalProvider;
