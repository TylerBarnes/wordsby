/* eslint-disable */

import React, { Component } from "react";
import getLength from "utf8-byte-length";

class InstantPublish extends Component {
  constructor(props) {
    super(props);

    this.state = {
      props: false,
      currentPath: false,
      debug: this.props.debug || false
    };

    this.getLiveData = this.getLiveData.bind(this);
    this.log = this.log.bind(this);
  }

  log(data) {
    if (this.state.debug) console.log(data);
  }

  async getLiveData() {
    const { wpUrl, latestBuild: latestBuildTime, id } = this.props.pageContext;
    const currentPath = this.props.location.pathname;
    const liveDataProps = this.props;

    const restUrl = `${wpUrl}/wp-json/wordsby/v1`;
    const lastPublishUrl = `${restUrl}/last_publish/${id}`;
    const liveDataUrl = `${restUrl}/instant_publish_collections/${id}`;

    this.log(`You have instant publish debug mode enabled.`);
    this.log(
      `Fetching data from ${liveDataUrl} and rehydrating the current page with live data.`
    );
    const storageName = `@@liveData|${currentPath}`;
    const sessionStorageString = sessionStorage.getItem(storageName);

    let latestPublishTime;
    let sessionStorageJSON;
    let liveData;

    // check for local storage data and use it if it's there.
    if (sessionStorageString) {
      sessionStorageJSON = JSON.parse(sessionStorageString);

      liveDataProps.data.wordsbyCollections =
        sessionStorageJSON.data.wordsbyCollections;

      this.log("current props + localstorage data:");
      this.log(liveDataProps);

      this.setState({
        props: liveDataProps,
        currentPath: currentPath
      });
    }

    // get the latest publish time of the current page from WP
    try {
      latestPublishTime = await (await fetch(lastPublishUrl)).json();
    } catch (e) {
      return console.warn(e);
    }

    // if the session storage data is current then
    // we can bail and keep using it.
    if (
      sessionStorageString &&
      sessionStorageJSON.latestPublishTime === latestPublishTime &&
      sessionStorageJSON.latestPublishTime > latestBuildTime &&
      !this.state.debug
    )
      return;

    // if the last publish was before the last build
    // then our data is current.
    // delete session storage data and use our regular props.
    if (latestPublishTime < latestBuildTime && !this.state.debug)
      return sessionStorageJSON
        ? sessionStorage.removeItem(storageName) &&
            this.setState({
              props: this.props,
              currentPath: currentPath
            })
        : false;

    try {
      [liveData] = await (await fetch(liveDataUrl)).json();
    } catch (e) {
      return console.warn(e);
    }

    this.log("live data response:");
    this.log(liveData);

    liveDataProps.data.wordsbyCollections = liveData;

    // set the updated props + current path so the page knows to update
    this.setState({
      props: liveDataProps,
      currentPath: currentPath
    });

    // check remaining sessionstorage space
    const limit = 1024 * 1024 * 5; // 5 MB
    const usedSpace = unescape(
      encodeURIComponent(JSON.stringify(sessionStorage))
    ).length;
    const remSpace = limit - usedSpace;

    this.log(`session storage bytes in use: ${usedSpace}`);
    this.log(`remaining bytes available: ${remSpace}`);

    // get a string of our data.
    const jsonString = JSON.stringify({
      data: { wordsbyCollections: liveData },
      latestPublishTime: latestPublishTime
    });

    const dataLength = getLength(jsonString);

    // if our string takes more storage than what's left, clear the storage
    if (dataLength > remSpace) sessionStorage.clear();

    // store data in session storage so that reloads dont require more http requests.
    sessionStorage.setItem(storageName, jsonString);
    this.log(`session data stored in key: ${storageName}`);
  }

  componentDidMount = () => this.getLiveData();

  componentDidUpdate(previousProps) {
    // only update if we're on a new page.
    // Sometimes the component does extra updates
    if (previousProps.location.pathname !== this.props.location.pathname) {
      this.setState({ props: false });
      this.getLiveData();
    }
  }

  render = () => {
    const { children, location } = this.props;
    const { props: stateProps, currentPath } = this.state;

    if (
      stateProps &&
      stateProps.data &&
      currentPath &&
      currentPath === location.pathname
    ) {
      return React.cloneElement(children, stateProps);
    } else {
      return React.cloneElement(children, this.props);
    }
  };
}

export default InstantPublish;
