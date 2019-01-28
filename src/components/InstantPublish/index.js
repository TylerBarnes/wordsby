import React, { Component } from "react";
import { parse, stringify } from "flatted/esm";

class InstantPublish extends Component {
  constructor(props) {
    super(props);

    this.state = {
      props: false,
      currentPath: false
    };

    this.getLiveData = this.getLiveData.bind(this);
  }

  async getLiveData() {
    const { wpUrl, latestBuild: latestBuildTime, id } = this.props.pageContext;
    const currentPath = this.props.location.pathname;
    const liveDataProps = this.props;

    const restUrl = `${wpUrl}/wp-json/wordsby/v1`;
    const lastPublishUrl = `${restUrl}/last_publish/${id}`;
    const liveDataUrl = `${restUrl}/collections/${id}`;

    const storageName = `@@liveData|${currentPath}`;
    const sessionStorageString = sessionStorage.getItem(storageName);

    let latestPublishTime;
    let sessionStorageJSON;
    let liveData;

    // check for local storage data and use it if it's there.
    if (sessionStorageString) {
      sessionStorageJSON = parse(sessionStorageString);

      liveDataProps.data.wordsbyCollections =
        sessionStorageJSON.props.data.wordsbyCollections;

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
      sessionStorageJSON.latestPublishTime == latestPublishTime &&
      sessionStorageJSON.latestPublishTime > latestBuildTime
    )
      return;

    // if the last publish was before the last build
    // then our data is current.
    // delete session storage data and use our regular props.
    if (latestPublishTime < latestBuildTime)
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

    // overwrite single page data from live data
    liveDataProps.data.wordsbyCollections = liveData;

    // set the updated props + current path so the page knows to update
    this.setState({
      props: liveDataProps,
      currentPath: currentPath
    });

    // store everything in session storage so that reloads dont require more http requests.
    sessionStorage.setItem(
      storageName,
      stringify({
        props: liveDataProps,
        latestPublishTime: latestPublishTime
      })
    );
  }

  componentDidMount = () => this.getLiveData();

  componentDidUpdate(previousProps) {
    if (previousProps.location.pathname !== this.props.location.pathname) {
      this.setState({ props: false });
      this.getLiveData();
    }
  }

  render = () => {
    if (
      this.state.props &&
      this.state.props.data &&
      this.state.currentPath &&
      this.state.currentPath === this.props.location.pathname
    ) {
      return React.cloneElement(this.props.children, this.state.props);
    } else {
      return React.cloneElement(this.props.children, this.props);
    }
  };
}

export default InstantPublish;
