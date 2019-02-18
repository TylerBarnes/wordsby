import React, { Component } from "react";
import PreviewLoader from "./PreviewLoader";
import Helmet from "react-helmet";

let robot = false;
let postRobot;
if (typeof window !== `undefined`) {
  postRobot = require("post-robot");
} else {
  postRobot = false;
}

class Preview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      previewData: false,
      error: false
    };

    this.getPreviewDataFromPostRobot = this.getPreviewDataFromPostRobot.bind(
      this
    );

    if (!!postRobot && robot.cancel) {
      robot.cancel();
    }
  }

  inIframe() {
    if (typeof window === "undefined") return false;

    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  getPreviewDataFromPostRobot = () => {
    postRobot.on("previewDataLoaded", event => {
      const previewData = event.data.previewData;

      this.setState({ previewData: previewData });

      return {
        previewDataLoaded: true
      };
    });

    setTimeout(
      () =>
        postRobot.send(window.parent, "iframeReadyForData", {
          iframeReady: true
        }),
      1000
    );

    return;
  };

  componentDidMount() {
    if (this.inIframe()) {
      return this.getPreviewDataFromPostRobot();
    }

    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : false;

    if (!urlParams) return;

    const rest_base = urlParams.get("rest_base");
    const post_id = urlParams.get("preview");
    const nonce = urlParams.get("nonce");

    if ((!rest_base || !post_id || !nonce) && !this.inIframe()) {
      // redirect home if a preview page is accessed directly
      window.location.href = "/";
    }

    console.log("preview props", this.props);
    const { siteUrl, env } = this.props.pageContext;
    console.log("site url", siteUrl);
    console.log("env", env);

    const rest_url = `${siteUrl}/wp-json/wp/v2/${rest_base}/${post_id}/preview/${
      env !== "development" ? `?_wpnonce=${nonce}` : ""
    }`;

    console.log("rest_url", rest_url);

    fetch(rest_url)
      .then(res => {
        console.log("response", res);
        return res.json();
      })
      .then(res => {
        console.log("json response", res);

        if (res && res.ID) {
          console.log("Updating preview data");
          this.setState({ previewData: res });
        } else if (res && res.code) {
          this.setState({
            error: {
              title: "Oh no! <br> There's been an error :(",
              message: `To fix: <br>
                        Close this page, log out of WordPress, log back in, and try again.<br>
                        If the issue persists, copy this message and send it to your web developer.`,
              error: res
            }
          });
        } else {
          this.setState({
            error: {
              title: "Dang,",
              message:
                "<h3>looks like something went wrong!</h3><br> There was no response from the server. <br>Contact your web developer for help."
            }
          });
        }
      })
      .catch(error => console.warn(error));
  }
  render() {
    const {
      props: {
        children,
        data: { wordpressWpCollections, wordsbyCollections, ...rest }
      }
    } = this;

    if (this.state.previewData && typeof window !== "undefined") {
      const childrenWithPreview = React.Children.map(children, child => {
        return React.cloneElement(child, {
          data: {
            wordsbyCollections: this.state.previewData,
            ...rest
          },
          previewData: {
            wordsbyCollections: this.state.previewData,
            ...rest
          }
        });
      });
      return childrenWithPreview;
    } else {
      return <PreviewLoader error={this.state.error} />;
    }
  }
}

const PreviewContainer = props => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Preview {...props} />
    </>
  );
};

export default PreviewContainer;
