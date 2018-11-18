import React, { Component } from "react";
import PreviewLoader from "./PreviewLoader";

export default class Preview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      previewData: false,
      error: false
    };
  }
  componentDidMount() {
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : false;

    if (!urlParams) return;

    const rest_base = urlParams.get("rest_base");
    const post_id = urlParams.get("preview");
    const nonce = urlParams.get("nonce");

    if (!rest_base || !post_id || !nonce) {
      return this.setState({
        error: {
          title: "Oops...",
          message:
            'It looks like this page was accessed directly.<br> For a preview, log in to wordpress and click the "Preview" button from the edit screen.'
        }
      });
    }

    // const rest_url = `http://temperance.online/wp-json/wp/v2/${rest_base}/${post_id}/preview`;
    const rest_url = `/wp-json/wp/v2/${rest_base}/${post_id}/preview/?_wpnonce=${nonce}`;

    console.log(rest_url);

    fetch(rest_url)
      .then(res => {
        console.log(res);
        return res.json();
      })
      .then(res => {
        console.log(res);

        if (res && res.ID) {
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
      });
  }
  render() {
    const {
      props: { children }
    } = this;

    if (this.state.previewData && typeof window !== "undefined") {
      const childrenWithPreview = React.Children.map(children, child => {
        return React.cloneElement(child, {
          data: { wordpressWpCollections: this.state.previewData },
          previewData: { wordpressWpCollections: this.state.previewData }
        });
      });

      return childrenWithPreview;
    } else {
      return <PreviewLoader error={this.state.error} />;
    }
  }
}
